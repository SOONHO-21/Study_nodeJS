import {createServer} from 'http'

const server = createServer((rep, res) => {
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.write('Hello node js');
    res.end();
});

server.listen(3000, () => {
    console.log('server node 3000');
});