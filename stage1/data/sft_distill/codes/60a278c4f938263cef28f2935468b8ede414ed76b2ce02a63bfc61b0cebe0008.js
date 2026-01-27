// 完整的 Phaser3 可拖拽菱形游戏
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
  const diamondSize = 80;

  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  createDiamondTexture(graphics, 'diamondGray', diamondSize, 0x808080);
  
  // 创建蓝色菱形纹理（拖拽时使用）
  createDiamondTexture(graphics, 'diamondBlue', diamondSize, 0x4a90e2);
  
  // 销毁 graphics 对象
  graphics.destroy();

  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为蓝色
    gameObject.setTexture('diamondBlue');
    // 可选：增加缩放效果
    gameObject.setScale(1.1);
  });

  // 监听拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新菱形位置
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复缩放
    gameObject.setScale(1);
    
    // 使用 Tween 动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 动画完成后恢复灰色
        gameObject.setTexture('diamondGray');
      }
    });
  });

  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

// 辅助函数：创建菱形纹理
function createDiamondTexture(graphics, key, size, color) {
  graphics.clear();
  graphics.fillStyle(color, 1);
  
  // 绘制菱形路径
  const halfSize = size / 2;
  const path = new Phaser.Geom.Polygon([
    0, -halfSize,        // 上顶点
    halfSize, 0,         // 右顶点
    0, halfSize,         // 下顶点
    -halfSize, 0         // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture(key, size, size);
}

// 启动游戏
new Phaser.Game(config);