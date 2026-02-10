const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let keyW, keyA, keyS, keyD;
const SPEED = 300; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建菱形 Graphics 对象
  diamond = this.add.graphics();
  diamond.x = 400;
  diamond.y = 300;
  
  // 绘制菱形
  drawDiamond(diamond);
  
  // 添加 WASD 键盘监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keyW.isDown) {
    diamond.y -= distance;
  }
  if (keyS.isDown) {
    diamond.y += distance;
  }
  if (keyA.isDown) {
    diamond.x -= distance;
  }
  if (keyD.isDown) {
    diamond.x += distance;
  }
  
  // 边界限制（可选）
  diamond.x = Phaser.Math.Clamp(diamond.x, 0, 800);
  diamond.y = Phaser.Math.Clamp(diamond.y, 0, 600);
}

// 辅助函数：绘制菱形
function drawDiamond(graphics) {
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(0, -30);    // 上顶点
  graphics.lineTo(25, 0);     // 右顶点
  graphics.lineTo(0, 30);     // 下顶点
  graphics.lineTo(-25, 0);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);