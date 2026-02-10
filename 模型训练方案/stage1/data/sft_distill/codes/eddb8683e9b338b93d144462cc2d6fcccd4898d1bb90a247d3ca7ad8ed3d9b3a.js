const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let ellipse;
let keyW, keyA, keyS, keyD;
const SPEED = 120; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建椭圆图形
  ellipse = this.add.graphics();
  ellipse.fillStyle(0x00ff00, 1);
  ellipse.fillEllipse(0, 0, 60, 40); // 中心点在 (0,0)，宽60，高40
  
  // 设置初始位置
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 添加 WASD 键盘监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaSeconds = delta / 1000;
  const movement = SPEED * deltaSeconds;
  
  // 根据按键状态更新位置
  if (keyW.isDown) {
    ellipse.y -= movement;
  }
  if (keyS.isDown) {
    ellipse.y += movement;
  }
  if (keyA.isDown) {
    ellipse.x -= movement;
  }
  if (keyD.isDown) {
    ellipse.x += movement;
  }
  
  // 边界限制（可选）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 30, 770);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 20, 580);
}

new Phaser.Game(config);