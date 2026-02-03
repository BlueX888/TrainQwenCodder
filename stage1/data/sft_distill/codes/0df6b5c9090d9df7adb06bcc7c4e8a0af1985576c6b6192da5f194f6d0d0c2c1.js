const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let ellipse;
let keyW, keyA, keyS, keyD;
const SPEED = 360; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', 60, 60);
  graphics.destroy();
  
  // 创建椭圆精灵，放置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 绑定 WASD 键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaSeconds = delta / 1000;
  const moveDistance = SPEED * deltaSeconds;
  
  // 检测按键并移动椭圆
  if (keyW.isDown) {
    ellipse.y -= moveDistance;
  }
  if (keyS.isDown) {
    ellipse.y += moveDistance;
  }
  if (keyA.isDown) {
    ellipse.x -= moveDistance;
  }
  if (keyD.isDown) {
    ellipse.x += moveDistance;
  }
  
  // 边界限制（可选）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);