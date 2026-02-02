const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点
  const hexRadius = 60;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPoints.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillPoints(hexPoints, true);
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePoints(hexPoints, true);
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建可拖拽的六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 100, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', (pointer) => {
    // 放大到 1.2 倍
    hexagon.setScale(1.2);
    // 提升层级，确保在最上层
    hexagon.setDepth(1);
  });
  
  // 监听拖拽事件
  hexagon.on('drag', (pointer, dragX, dragY) => {
    // 更新六边形位置
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', (pointer) => {
    // 恢复原始大小
    hexagon.setScale(1);
    // 恢复层级
    hexagon.setDepth(0);
  });
  
  // 添加鼠标悬停效果（可选，增强交互体验）
  hexagon.on('pointerover', () => {
    if (hexagon.scaleX === 1) {
      hexagon.setTint(0xffff00);
    }
  });
  
  hexagon.on('pointerout', () => {
    hexagon.clearTint();
  });
}

new Phaser.Game(config);