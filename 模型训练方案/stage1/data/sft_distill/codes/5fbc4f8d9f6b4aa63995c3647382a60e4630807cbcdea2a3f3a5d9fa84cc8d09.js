const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let hexagon;
let cursors;
const SPEED = 300;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制六边形（正六边形，半径30）
  const radius = 30;
  const sides = 6;
  const centerX = radius;
  const centerY = radius;
  
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，位置在画布中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    hexagon.x -= distance;
  }
  if (cursors.right.isDown) {
    hexagon.x += distance;
  }
  if (cursors.up.isDown) {
    hexagon.y -= distance;
  }
  if (cursors.down.isDown) {
    hexagon.y += distance;
  }
  
  // 限制在画布边界内（考虑六边形的半径30）
  const radius = 30;
  hexagon.x = Phaser.Math.Clamp(hexagon.x, radius, 800 - radius);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, radius, 600 - radius);
}

new Phaser.Game(config);