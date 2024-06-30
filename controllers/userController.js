const users = require("../models/userSchema");
const moment = require("moment");
const csv = require("fast-csv");
const fs = require("fs");
const BASE_URL=process.env.BASE_URL;

exports.userRegistering = async (req, res) => {
  const file = req.file.filename;
  const { fname, lname, email, phone, gender, location, status } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !phone ||
    !gender ||
    !location ||
    !status ||
    !file
  ) {
    res.status(401).json("All inputs are required");
  }

  try {
    const preuserByEmail = await users.findOne({ email });
    const preuserByPhone = await users.findOne({ phone });

    if (preuserByEmail) {
      return res
        .status(401)
        .json("User already exists with this email in the database");
    } else if (preuserByPhone) {
      return res
        .status(401)
        .json("User already exists with this phone number in the database");
    } else {
      const dateCreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
      const userData = new users({
        fname,
        lname,
        email,
        phone,
        gender,
        location,
        status,
        image: file,
        dateCreated,
      });
      console.log(userData);
      await userData.save();
      res.status(200).json(userData);
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block error", error);
  }
};

exports.userDetails = async (req, res) => {
  const search = req.query.search || "";
  const gender = req.query.gender || "";
  const status = req.query.status || "";
  const sort = req.query.sort || "";
  const page = req.query.page || 1;
  const ITEMS_PER_PAGE = 4;

  const query = {
    fname: { $regex: search, $options: "i" }, //options tell both upper lower accepted
  };

  if (gender !== "all") {
    query.gender = gender;
  }
  if (status !== "All") {
    query.status = status;
  }
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const count=await users.countDocuments(query);
    const userdata = await users
      .find(query)
      .sort({ dateCreated: sort === "new" ? -1 : 1 })
      .limit(ITEMS_PER_PAGE)
      .skip(skip);

    const pagecount=Math.ceil(count/ITEMS_PER_PAGE);
    res.status(200).json({
      pagination:{
        count,pagecount
      },
      userdata
    });
  } catch (error) {
    res.status(401).json(error);
  }
};
//if want to check on postman than add in headers contenttype application json

exports.getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userdata = await users.findOne({ _id: id });
    res.status(200).json(userdata);
  } catch (error) {
    res.status(401).json(error);
  }
};

exports.userUpdating = async (req, res) => {
  const { id } = req.params;
  const { fname, lname, email, phone, gender, location, status, user_profile } =
    req.body;
  const file = req.file ? req.file.filename : user_profile;
  const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  try {
    const updateuser = await users.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        phone,
        gender,
        location,
        status,
        image: file,
        dateUpdated,
      },
      {
        new: true, //so it send new value
      }
    );
    await updateuser.save();
    res.status(200).json(updateuser);
  } catch (error) {
    res.status(401).json(error);
  }
};

exports.userDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteuser = await users.findByIdAndDelete({ _id: id });
    console.log(deleteuser);
    res.status(200).json(deleteuser);
  } catch (error) {
    res.status(401).json(error);
  }
};

exports.statusUpdate = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const updateduser = await users.findByIdAndUpdate(
      { _id: id },
      { status: data },
      { new: true }
    );
    res.status(200).json(updateduser);
  } catch (error) {
    res.status(401).json(error);
  }
};

exports.exporting = async (req, res) => {
  try {
    const usersdata = await users.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }
      if (!fs.existsSync("public/files/export")) {
        fs.mkdirSync("./public/files/export");
      }
    }

    const writeablestream = fs.createWriteStream(
      "public/files/export/users.csv"
    ); //write file name u want
    csvStream.pipe(writeablestream);

    writeablestream.on("finish", () => {
      res.json({
        downloadUrl: `${BASE_URL}/files/export/users.csv`,
      });
    });

    if (usersdata.length > 0) {
      usersdata.map((user) => {
        csvStream.write({
          FirstName: user.fname ? user.fname : "-",
          LastName: user.lname ? user.lname : "-",
          Email: user.email ? user.email : "-",
          Gender: user.gender ? user.gender : "-",
          Status: user.status ? user.status : "-",
          Phone: user.phone ? user.phone : "-",
          Location: user.location ? user.location : "-",
          DateCreated: user.dateCreated ? user.dateCreated : "-",
          DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
        });
      });
    }
    csvStream.end();
    writeablestream.end();
  } catch (error) {
    res.status(401).json(error);
  }
};
