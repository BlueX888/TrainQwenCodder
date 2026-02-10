const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建六边形纹理
  createHexagonTexture(this);
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到1.2倍
  hexagon.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
    // 提升深度，使其在最上层
    this.setDepth(1);
  });
  
  // 监听拖拽事件 - 更新位置
  hexagon.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原大小
  hexagon.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1.0);
    this.setDepth(0);
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 创建六边形纹理
 * @param {Phaser.Scene} scene - 当前场景
 */
function createHexagonTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 六边形参数
  const size = 60; // 六边形大小
  const centerX = 64; // 纹理中心X
  const centerY = 64; // 纹理中心Y
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillPoints(points, true);
  
  // 绘制边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 128, 128);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
}

new Phaser.Game(config);