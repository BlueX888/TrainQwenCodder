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

  // 创建白色菱形纹理
  const graphics = this.add.graphics();
  createDiamondTexture(graphics, 'whiteDiamond', diamondSize, 0xffffff);
  
  // 创建黄色菱形纹理（拖拽时使用）
  createDiamondTexture(graphics, 'yellowDiamond', diamondSize, 0xffff00);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();

  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'whiteDiamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为黄色
    gameObject.setTexture('yellowDiamond');
    // 可选：增加缩放效果
    gameObject.setScale(1.1);
  });

  // 监听拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新菱形位置
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复白色
    gameObject.setTexture('whiteDiamond');
    // 恢复原始缩放
    gameObject.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

/**
 * 创建菱形纹理的辅助函数
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {string} key - 纹理键名
 * @param {number} size - 菱形大小
 * @param {number} color - 填充颜色
 */
function createDiamondTexture(graphics, key, size, color) {
  graphics.clear();
  graphics.fillStyle(color, 1);
  
  // 绘制菱形路径
  graphics.beginPath();
  graphics.moveTo(size / 2, 0);           // 顶点
  graphics.lineTo(size, size / 2);        // 右点
  graphics.lineTo(size / 2, size);        // 底点
  graphics.lineTo(0, size / 2);           // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使其更明显
  graphics.lineStyle(3, 0x000000, 0.5);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture(key, size, size);
}

// 启动游戏
new Phaser.Game(config);