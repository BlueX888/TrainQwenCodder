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

let diamond;
let keys;
const SPEED = 80; // 像素/秒

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建菱形 Graphics 对象
  diamond = this.add.graphics();
  diamond.x = 400;
  diamond.y = 300;
  
  // 绘制菱形
  drawDiamond(diamond);
  
  // 设置 WASD 键盘输入
  keys = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
}

function update(time, delta) {
  // 计算本帧移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    diamond.y -= distance;
  }
  if (keys.s.isDown) {
    diamond.y += distance;
  }
  if (keys.a.isDown) {
    diamond.x -= distance;
  }
  if (keys.d.isDown) {
    diamond.x += distance;
  }
  
  // 边界限制（可选）
  diamond.x = Phaser.Math.Clamp(diamond.x, 30, 770);
  diamond.y = Phaser.Math.Clamp(diamond.y, 30, 570);
}

function drawDiamond(graphics) {
  // 绘制菱形（40x40 像素）
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(0, -20);   // 上顶点
  graphics.lineTo(20, 0);    // 右顶点
  graphics.lineTo(0, 20);    // 下顶点
  graphics.lineTo(-20, 0);   // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);