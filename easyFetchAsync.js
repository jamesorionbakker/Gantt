class easyFetchAsync {
    async get(url) {
        let response = await fetch(url);
        let resData = await response.json();
        return resData;
    }
    async post(url, data) {
        let response = await fetch(url, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data)
        })
        let resData = await response.json();
        return resData;
    }
    async put(url, data) {
        let response = await fetch(url, {
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data)
        })
        let resData = await response.json();
        return resData;
    }
    async delete(url) {
        let response = await fetch(url, {
            method: 'DELETE',
            headers: {'content-type': 'application/json'}
        })
        let resData = await 'resource deleted';
        return resData;
    }
}