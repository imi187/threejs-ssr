import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import Jimp from "jimp"
import * as THREE from "three"
import { JSDOM } from "jsdom"
import gl from 'gl'

// Create Server Dom
dotenv.config();
const { window } = new JSDOM();
global.document = window.document;

// Create Server
const app: Express = express()
const port = process.env.PORT || 3000

// Create ThreeJS Scene
const width = 600
const height = 400
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
const glContext = gl(width, height, { preserveDrawingBuffer: true })
const renderer = new THREE.WebGLRenderer({ context: glContext })
renderer.setSize(width, height)

const light1 = new THREE.PointLight()
light1.position.set(50, 50, 50)
scene.add(light1);

const light2 = new THREE.PointLight()
light2.position.set(-50, 50, 50)
scene.add(light2);
camera.position.z = 30

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(1, 1, 1)
scene.add(cube);

// Define Image render endpoint
app.get("/image", (req: Request, res: Response) => {
  renderer.render(scene, camera)
  const bitmapData = new Uint8Array(width * height * 4)
  glContext.readPixels(0, 0, width, height, glContext.RGBA, glContext.UNSIGNED_BYTE, bitmapData)
  new Jimp(width, height, (err: object, image: any) => {
    image.bitmap.data = bitmapData
    image.getBuffer("image/png", (err: object, buffer: Uint8Array) => {
      res.send(Buffer.from(buffer))
    });
  })
});

// Define root path html
app.get("/", (req: Request, res: Response) => {
  res.send("<img style='background-color: black' src='/image'>");
});

// Start Server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});