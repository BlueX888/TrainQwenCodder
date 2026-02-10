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

let star;
let cursors;
const SPEED = 160;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制五角星
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵
  star = this.add.sprite(400, 300, 'star');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（基于时间差，确保帧率无关）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    star.x -= distance;
  } else if (cursors.right.isDown) {
    star.x += distance;
  }
  
  if (cursors.up.isDown) {
    star.y -= distance;
  } else if (cursors.down.isDown) {
    star.y += distance;
  }
  
  // 限制在画布边界内
  const halfWidth = star.width / 2;
  const halfHeight = star.height / 2;
  
  star.x = Phaser.Math.Clamp(star.x, halfWidth, config.width - halfWidth);
  star.y = Phaser.Math.Clamp(star.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);