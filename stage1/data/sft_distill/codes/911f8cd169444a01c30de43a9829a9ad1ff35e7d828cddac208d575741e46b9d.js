const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  createDiamondTexture(graphics, 'diamond_gray', 0x808080);
  
  // 创建蓝色菱形纹理（拖拽时使用）
  createDiamondTexture(graphics, 'diamond_blue', 0x4a90e2);
  
  // 清除 graphics 对象
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamond_gray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  diamond.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('diamond_blue');
  });
  
  // 监听拖拽中事件
  diamond.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', function(pointer) {
    // 恢复灰色
    this.setTexture('diamond_gray');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 创建菱形纹理
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {string} key - 纹理键名
 * @param {number} color - 填充颜色
 */
function createDiamondTexture(graphics, key, color) {
  graphics.clear();
  graphics.fillStyle(color, 1);
  
  // 绘制菱形路径（中心点在 50, 50，宽高各 100）
  const path = new Phaser.Geom.Polygon([
    50, 0,    // 上顶点
    100, 50,  // 右顶点
    50, 100,  // 下顶点
    0, 50     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture(key, 100, 100);
}

// 启动游戏
new Phaser.Game(config);