function MultikeyDict() {
    this.num_items = 0;
    this.num_keys = 0;
    this.storage = {};
    this.keys = {};
} // MultikeyDict

MultikeyDict.prototype.set = function(keys, value) {
    this.storage["" + this.num_items] = value;
    for (var i = 0; i < keys.length; i++) {
        this.keys[keys[i]] = this.num_items;
    } // for
    this.num_items++;
    this.num_keys += keys.length;
} // MultikeyDict.set

MultikeyDict.prototype.get = function(key) {
    return this.storage[this.keys[key]];
} // MultikeyDict.get 

MultikeyDict.prototype.addKey = function(original_key, new_key) {
    var assigned_index = this.keys[original_key];
    this.keys[new_key] = assigned_index;
    this.num_keys++;
} // MultikeyDict.addKey

MultikeyDict.prototype.hasKey = function(key) {
    return (key in this.keys);
} // MultikeyDict.hasKey
