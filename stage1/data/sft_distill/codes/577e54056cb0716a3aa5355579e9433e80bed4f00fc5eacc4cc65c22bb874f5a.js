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
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点为原点）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置键盘输入监听 WASD
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动方向向量
  let velocityX = 0;
  let velocityY = 0;
  
  if (keys.W.isDown) {
    velocityY = -1;
  } else if (keys.S.isDown) {
    velocityY = 1;
  }
  
  if (keys.A.isDown) {
    velocityX = -1;
  } else if (keys.D.isDown) {
    velocityX = 1;
  }
  
  // 如果有移动输入，归一化向量并应用速度
  if (velocityX !== 0 || velocityY !== 0) {
    // 创建向量并归一化（确保对角线移动速度一致）
    const velocity = new Phaser.Math.Vector2(velocityX, velocityY);
    velocity.normalize();
    
    // 根据 delta 时间计算实际移动距离
    const moveDistance = SPEED * (delta / 1000);
    
    // 更新菱形位置
    diamond.x += velocity.x * moveDistance;
    diamond.y += velocity.y * moveDistance;
    
    // 限制在屏幕范围内
    diamond.x = Phaser.Math.Clamp(diamond.x, 0, 800);
    diamond.y = Phaser.Math.Clamp(diamond.y, 0, 600);
  }
}

new Phaser.Game(config);