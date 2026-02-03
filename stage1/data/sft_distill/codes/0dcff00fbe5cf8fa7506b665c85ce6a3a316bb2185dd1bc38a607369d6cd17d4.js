const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationStatus = 'running';
let statusText;
let objects = [];
let tweens = [];

function preload() {
  // 不需要加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 创建3个不同颜色的矩形纹理
  const colors = [
    { name: 'red', color: 0xff0000 },
    { name: 'green', color: 0x00ff00 },
    { name: 'blue', color: 0x0000ff }
  ];
  
  colors.forEach(colorData => {
    graphics.clear();
    graphics.fillStyle(colorData.color, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(colorData.name, 80, 80);
  });
  
  graphics.destroy();
  
  // 创建3个精灵对象，水平排列
  const startX = 200;
  const spacing = 200;
  const y = 300;
  
  colors.forEach((colorData, index) => {
    const sprite = this.add.sprite(
      startX + index * spacing,
      y,
      colorData.name
    );
    sprite.setOrigin(0.5, 0.5);
    objects.push(sprite);
    
    // 为每个对象创建旋转动画
    const tween = this.tweens.add({
      targets: sprite,
      angle: 360, // 旋转360度
      duration: 4000, // 持续4秒
      ease: 'Linear',
      onComplete: () => {
        // 所有动画完成后更新状态
        if (tweens.every(t => !t.isPlaying())) {
          animationStatus = 'stopped';
          statusText.setText(`Status: ${animationStatus} ✓`);
          statusText.setColor('#00ff00');
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 显示状态文本
  statusText = this.add.text(400, 100, `Status: ${animationStatus}`, {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  statusText.setOrigin(0.5, 0.5);
  
  // 显示说明文本
  this.add.text(400, 500, '3个物体将同步旋转4秒后停止', {
    fontSize: '20px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5, 0.5);
  
  // 显示计时器
  let timeElapsed = 0;
  const timerText = this.add.text(400, 150, `Time: 0.0s / 4.0s`, {
    fontSize: '24px',
    color: '#ffff00',
    fontFamily: 'Arial'
  });
  timerText.setOrigin(0.5, 0.5);
  
  // 更新计时器
  this.time.addEvent({
    delay: 100,
    callback: () => {
      if (animationStatus === 'running') {
        timeElapsed += 0.1;
        if (timeElapsed > 4.0) timeElapsed = 4.0;
        timerText.setText(`Time: ${timeElapsed.toFixed(1)}s / 4.0s`);
      }
    },
    loop: true
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前示例中主要逻辑由 Tween 系统处理
}

new Phaser.Game(config);