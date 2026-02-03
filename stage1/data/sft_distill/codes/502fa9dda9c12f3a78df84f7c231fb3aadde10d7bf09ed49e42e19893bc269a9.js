const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let hexagon;
let cursors;
const SPEED = 360; // 每秒移动像素数
const HEX_RADIUS = 30; // 六边形半径

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色六边形
  const graphics = this.add.graphics();
  
  // 绘制六边形
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  graphics.beginPath();
  
  // 六边形的六个顶点（中心在 HEX_RADIUS, HEX_RADIUS）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶点开始
    const x = HEX_RADIUS + HEX_RADIUS * Math.cos(angle);
    const y = HEX_RADIUS + HEX_RADIUS * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', HEX_RADIUS * 2, HEX_RADIUS * 2);
  graphics.destroy();
  
  // 创建六边形精灵，放置在画布中心
  hexagon = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'hexagon'
  );
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  const moveDistance = SPEED * deltaSeconds;
  
  // 检测方向键并移动六边形
  if (cursors.left.isDown) {
    hexagon.x -= moveDistance;
  }
  if (cursors.right.isDown) {
    hexagon.x += moveDistance;
  }
  if (cursors.up.isDown) {
    hexagon.y -= moveDistance;
  }
  if (cursors.down.isDown) {
    hexagon.y += moveDistance;
  }
  
  // 限制在画布边界内
  const minX = HEX_RADIUS;
  const maxX = config.width - HEX_RADIUS;
  const minY = HEX_RADIUS;
  const maxY = config.height - HEX_RADIUS;
  
  hexagon.x = Phaser.Math.Clamp(hexagon.x, minX, maxX);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, minY, maxY);
}

new Phaser.Game(config);