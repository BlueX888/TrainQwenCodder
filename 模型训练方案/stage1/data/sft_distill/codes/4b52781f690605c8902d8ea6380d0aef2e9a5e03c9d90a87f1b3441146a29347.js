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
const MOVE_SPEED = 100; // 每秒移动像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillStar(32, 32, 5, 16, 32, 0);
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();

  // 创建背景网格以便观察相机移动
  createBackgroundGrid.call(this);

  // 创建星形精灵
  star = this.add.sprite(400, 300, 'starTexture');
  star.setOrigin(0.5, 0.5);

  // 添加发光效果
  star.setTint(0xffff00);

  // 设置相机跟随星形
  this.cameras.main.startFollow(star, true, 0.1, 0.1);

  // 设置相机边界（可选，让场景更大）
  this.cameras.main.setBounds(0, 0, 2000, 2000);

  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随星形移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景移动
}

function update(time, delta) {
  // 让星形向右上方移动
  // delta 是毫秒，转换为秒
  const deltaSeconds = delta / 1000;
  
  // 向右移动
  star.x += MOVE_SPEED * deltaSeconds;
  
  // 向上移动（Y轴向下为正，所以减去）
  star.y -= MOVE_SPEED * deltaSeconds;

  // 可选：旋转星形增加视觉效果
  star.angle += 60 * deltaSeconds;
}

// 辅助函数：创建背景网格
function createBackgroundGrid() {
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);

  // 绘制网格
  const gridSize = 100;
  const worldWidth = 2000;
  const worldHeight = 2000;

  // 垂直线
  for (let x = 0; x <= worldWidth; x += gridSize) {
    gridGraphics.lineBetween(x, 0, x, worldHeight);
  }

  // 水平线
  for (let y = 0; y <= worldHeight; y += gridSize) {
    gridGraphics.lineBetween(0, y, worldWidth, y);
  }

  // 添加一些参考点
  const pointGraphics = this.add.graphics();
  pointGraphics.fillStyle(0x00ff00, 0.3);
  
  for (let x = 0; x <= worldWidth; x += 200) {
    for (let y = 0; y <= worldHeight; y += 200) {
      pointGraphics.fillCircle(x, y, 5);
      
      // 添加坐标文本
      const coordText = this.add.text(x + 10, y - 10, `(${x},${y})`, {
        fontSize: '12px',
        color: '#00ff00'
      });
    }
  }
}

new Phaser.Game(config);