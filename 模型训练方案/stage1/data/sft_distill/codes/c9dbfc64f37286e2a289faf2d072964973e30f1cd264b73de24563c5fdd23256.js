const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建灰色菱形纹理
  createDiamondTexture(this, 'diamondGray', 0x888888);
  // 创建蓝色菱形纹理（拖拽时使用）
  createDiamondTexture(this, 'diamondBlue', 0x4444ff);
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为蓝色
    gameObject.setTexture('diamondBlue');
  });
  
  // 监听拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新位置跟随鼠标
    gameObject.setPosition(dragX, dragY);
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复灰色
    gameObject.setTexture('diamondGray');
    // 回到初始位置
    gameObject.setPosition(initialX, initialY);
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽灰色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 创建菱形纹理的辅助函数
 * @param {Phaser.Scene} scene - 场景对象
 * @param {string} key - 纹理键名
 * @param {number} color - 颜色值
 */
function createDiamondTexture(scene, key, color) {
  const graphics = scene.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(color, 1);
  
  // 定义菱形的四个顶点（中心在 50, 50）
  const points = [
    { x: 50, y: 10 },  // 上顶点
    { x: 90, y: 50 },  // 右顶点
    { x: 50, y: 90 },  // 下顶点
    { x: 10, y: 50 }   // 左顶点
  ];
  
  // 绘制填充的菱形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture(key, 100, 100);
  
  // 销毁 graphics 对象释放内存
  graphics.destroy();
}

new Phaser.Game(config);