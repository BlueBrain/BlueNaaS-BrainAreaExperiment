export default {
    'filterName': function(name) {
        return name.replace(/[^[a-z0-9 \/.\-()]/gi, '');
    },
};
