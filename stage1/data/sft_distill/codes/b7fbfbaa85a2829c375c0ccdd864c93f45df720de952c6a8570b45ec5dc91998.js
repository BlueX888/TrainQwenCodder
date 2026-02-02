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
  // 无需预加载外部资源
}

function create() {
  // 创建菱形图形对象
  diamond = this.add.graphics();
  diamond.x = 400;
  diamond.y = 300;
  
  // 绘制菱形（以中心点为原点）
  drawDiamond(diamond);
  
  // 添加 WASD 键监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间(秒)
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
  diamond.x = Phaser.Math.Clamp(diamond.x, 0, 800);
  diamond.y = Phaser.Math.Clamp(diamond.y, 0, 600);
}

/**
 * 绘制菱形
 * @param {Phaser.GameObjects.Graphics} graphics - 图形对象
 */
function drawDiamond(graphics) {
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  // 菱形的四个顶点（相对于中心点）
  graphics.moveTo(0, -30);   // 上顶点
  graphics.lineTo(25, 0);     // 右顶点
  graphics.lineTo(0, 30);     // 下顶点
  graphics.lineTo(-25, 0);    // 左顶点
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);