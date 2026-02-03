const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量：记录动画完成的数量
let animationCompleteCount = 0;
let statusText;
let objects = [];

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 重置状态
  animationCompleteCount = 0;
  objects = [];

  // 创建5个不同颜色的方块
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const startX = 150;
  const spacing = 130;

  for (let i = 0; i < 5; i++) {
    // 使用 Graphics 创建方块
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(-25, -25, 50, 50);
    
    // 生成纹理
    const textureName = `box${i}`;
    graphics.generateTexture(textureName, 50, 50);
    graphics.destroy();
    
    // 创建精灵对象
    const sprite = this.add.sprite(startX + i * spacing, 300, textureName);
    sprite.setOrigin(0.5, 0.5);
    objects.push(sprite);
    
    // 添加缩放动画
    this.tweens.add({
      targets: sprite,
      scaleX: 2,
      scaleY: 2,
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      onComplete: () => {
        animationCompleteCount++;
        updateStatusText();
      }
    });
  }

  // 创建状态显示文本
  statusText = this.add.text(400, 100, 'Animation Status: Running...', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  statusText.setOrigin(0.5, 0.5);

  // 添加说明文本
  const instructionText = this.add.text(400, 500, 
    'Watch the 5 boxes scale up and down synchronously for 0.5 seconds', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5, 0.5);

  // 显示初始状态
  updateStatusText();
}

function update(time, delta) {
  // 不需要每帧更新逻辑
}

function updateStatusText() {
  if (statusText) {
    if (animationCompleteCount === 0) {
      statusText.setText('Animation Status: Running...');
      statusText.setColor('#ffff00');
    } else if (animationCompleteCount < 5) {
      statusText.setText(`Animation Status: ${animationCompleteCount}/5 completed`);
      statusText.setColor('#ff9900');
    } else {
      statusText.setText('Animation Status: All 5 animations completed!');
      statusText.setColor('#00ff00');
    }
  }
}

new Phaser.Game(config);