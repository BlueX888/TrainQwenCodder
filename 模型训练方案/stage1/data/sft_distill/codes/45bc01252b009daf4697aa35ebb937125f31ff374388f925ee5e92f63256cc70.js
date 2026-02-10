const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationCompleted = false;
let objectsFlashing = 0;
let totalFlashCycles = 0;

function preload() {
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 重置状态变量
  animationCompleted = false;
  objectsFlashing = 0;
  totalFlashCycles = 0;

  const objects = [];
  const startX = 100;
  const startY = 100;
  const spacing = 120;
  const cols = 5;
  const rows = 3;

  // 创建15个物体（5列 x 3行）
  for (let i = 0; i < 15; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * spacing;
    const y = startY + row * spacing;
    
    const sprite = this.add.sprite(x, y, 'circle');
    sprite.setScale(1);
    objects.push(sprite);
  }

  objectsFlashing = objects.length;

  // 为每个物体创建同步闪烁动画
  objects.forEach((sprite, index) => {
    this.tweens.add({
      targets: sprite,
      alpha: 0,
      duration: 500, // 每次闪烁500ms
      yoyo: true, // 来回闪烁
      repeat: -1, // 无限重复
      ease: 'Sine.easeInOut',
      onRepeat: () => {
        // 只在第一个物体上统计闪烁周期
        if (index === 0) {
          totalFlashCycles++;
        }
      }
    });
  });

  // 2.5秒后停止所有动画
  this.time.delayedCall(2500, () => {
    // 停止所有 tween 动画
    this.tweens.killAll();
    
    // 将所有物体的 alpha 恢复为1（完全可见）
    objects.forEach(sprite => {
      sprite.alpha = 1;
    });
    
    animationCompleted = true;
    objectsFlashing = 0;
    
    // 显示完成文本
    const text = this.add.text(400, 500, 'Animation Completed!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    
    console.log('Animation completed after 2.5 seconds');
    console.log(`Total flash cycles: ${totalFlashCycles}`);
  });

  // 添加状态显示文本
  const statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 更新状态文本
  this.time.addEvent({
    delay: 100,
    callback: () => {
      statusText.setText([
        `Objects Flashing: ${objectsFlashing}`,
        `Flash Cycles: ${totalFlashCycles}`,
        `Animation Completed: ${animationCompleted}`,
        `Time Remaining: ${animationCompleted ? '0.0s' : ((2500 - this.time.now) / 1000).toFixed(1) + 's'}`
      ]);
    },
    loop: true
  });

  // 添加说明文本
  const infoText = this.add.text(400, 30, '15 objects flashing synchronously for 2.5 seconds', {
    fontSize: '20px',
    color: '#ffff00'
  });
  infoText.setOrigin(0.5);
}

function update(time, delta) {
  // 游戏循环逻辑（本例中主要逻辑在 create 中完成）
}

new Phaser.Game(config);