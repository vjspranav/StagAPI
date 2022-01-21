const { exec } = require("child_process");
const fs = require("fs");
const { compileFunction } = require("vm");
const xml2js = require("xml2js");

const edit_maintainer_string_xml = (
  path,
  device,
  device_company,
  device_codename,
  tg_username
) => {
  let lower_company = device_company.toLowerCase();
  // Read xml at path
  let parser = new xml2js.Parser();
  fs.readFile(path, function (err, data) {
    parser.parseString(data, function (err, result) {
      let tmp_category = 'device_category_' + lower_company + '_title';
      // check tmp_category is there is $.name
      let category_found = false;
      for (
        let i = 0;
        i < result.resources.string.length && !category_found;
        i++
      ) {
        if (result.resources.string[i].$.name == tmp_category) {
          category_found = true;
        }
      }
      if (!category_found) {
        console.log("creating category");
        let new_category = {
          $: {
            name: tmp_category,
            translatable: "false",
          },
          _: device_company,
        };
        result.resources.string.push(new_category);
      }
      let new_entries = [
        {
          _: device,
          $: {
            name: "device_" + device_codename,
            translatable: "false",
          },
        },
        {
          _: tg_username,
          $: {
            name: "device_" + device_codename + "_maintainer",
            translatable: "false",
          },
        },
        {
          _: device_codename + "\\n" + tg_username,
          $: {
            name: "device_" + device_codename + "_summary",
            translatable: "false",
          },
        },
      ];
      result.resources.string.push(...new_entries);
      let builder = new xml2js.Builder();
      let xml = builder.buildObject(result);
      fs.writeFile(path, xml, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
    });
  });
};

const edit_xml = (path, device_codename, device_company) => {
  device_company = device_company.toLowerCase();
  // Edit xml at path
  let parser = new xml2js.Parser();
  fs.readFile(path, function (err, data) {
    parser.parseString(data, function (err, result) {
      let t_id = "@+id/device_category_" + device_company;
      // check if t_id is there is android:id
      let id_found = false;
      for (
        let i = 0;
        i < result.PreferenceScreen.PreferenceCategory.length;
        i++
      ) {
        if (
          result.PreferenceScreen.PreferenceCategory[i].$["android:id"] == t_id
        ) {
          id_found = i + 1;
        }
      }
      if (!id_found) {
        console.log("creating category");
        let new_category = {
          '$': {
            'android:id': t_id,
            'android:title': '@string/device_category_' + device_company + '_title',
          },
          'Preference': []
        }
        result.PreferenceScreen.PreferenceCategory.push(new_category);
        id_found = result.PreferenceScreen.PreferenceCategory.length;
      } else {
        console.log("category already exists");
      }
      let new_pref = {
        '$': {
          'android:id': '@+id/device_' + device_codename,
          'android:icon': '@drawable/stag_device',
          'android:summary': '@string/device_' + device_codename + '_summary',
          'android:title': '@string/device_' + device_codename,
        }
      }
      result.PreferenceScreen.PreferenceCategory[id_found - 1].Preference = result.PreferenceScreen.PreferenceCategory[id_found - 1].Preference.filter(
        (pref) => {
          if(pref.$["android:id"] == '@+id/device_' + device_codename) {
            console.log("Replacing Maintainer");
          }
          return pref.$["android:id"] != '@+id/device_' + device_codename;
        }
      );
      result.PreferenceScreen.PreferenceCategory[id_found - 1].Preference.push(
        new_pref
      );
      let builder = new xml2js.Builder();
      let xml = builder.buildObject(result);
      fs.writeFile(path, xml, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
      );
    });
  });
};

const create_pr = (
  device_name,
  device_company,
  device_codename,
  maintainer_name,
  tg_username
) => {
  // Clone https://github.com/StagOS/android_packages_apps_Horns/ s12 branch
  let pr_branch = `s12-${device_codename}`;
  let pr_title = `${device_name}`;
  let pr_body = `Add maintainer for ${device_codename}`;
  // Clone repo to machine
  let repo_url = `https://github.com/StagOS/android_packages_apps_Horns/`;
  let repo_dir = `/tmp/android_packages_apps_Horns`;
  let repo_branch = `s12`;
  // Clone using exec
  exec(`git clone ${repo_url} ${repo_dir}`, (err, stdout, stderr) => {
    // Check for errors
    if (err || stderr) {
      console.log(err || stderr);
      return false;
    }
  });
};

edit_maintainer_string_xml("keys/m.xml", "Xiaomi Note 10 Pro", "Xiaomi", "sweetlassi", "jenni");
