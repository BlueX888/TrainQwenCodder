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

// 游戏对象
let hexagon;
let keys;

// 移动速度（像素/秒）
const SPEED = 360;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 绘制六边形
  const hexRadius = 40;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPoints.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制六边形路径
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 设置六边形初始位置（屏幕中心）
  graphics.x = 400;
  graphics.y = 300;
  
  // 保存六边形引用
  hexagon = graphics;
  
  // 设置 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    hexagon.y -= moveDistance;
  }
  
  if (keys.s.isDown) {
    hexagon.y += moveDistance;
  }
  
  if (keys.a.isDown) {
    hexagon.x -= moveDistance;
  }
  
  if (keys.d.isDown) {
    hexagon.x += moveDistance;
  }
  
  // 可选：限制六边形在屏幕范围内
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

// 启动游戏
new Phaser.Game(config);