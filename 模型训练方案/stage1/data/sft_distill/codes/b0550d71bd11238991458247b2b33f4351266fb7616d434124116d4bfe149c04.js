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

// 验证状态变量
let animationStatus = 'running'; // 可能值: 'running', 'stopped'
let blinkCount = 0; // 闪烁次数计数器

function preload() {
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  const objects = [];
  const tweens = [];
  
  // 创建20个物体，排列成4行5列
  const rows = 4;
  const cols = 5;
  const startX = 150;
  const startY = 100;
  const spacingX = 120;
  const spacingY = 120;
  
  for (let i = 0; i < 20; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    // 创建图形对象
    const obj = this.add.image(x, y, 'circle');
    obj.setTint(0x00ff00);
    objects.push(obj);
    
    // 为每个物体创建闪烁动画
    const tween = this.tweens.add({
      targets: obj,
      alpha: 0,
      duration: 500, // 单次闪烁持续0.5秒
      yoyo: true, // 来回闪烁
      repeat: -1, // 无限重复
      onRepeat: () => {
        blinkCount++;
      }
    });
    
    tweens.push(tween);
  }
  
  // 显示状态文本
  const statusText = this.add.text(400, 30, 'Animation Status: Running', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  const timerText = this.add.text(400, 60, 'Time Remaining: 3.0s', {
    fontSize: '20px',
    color: '#ffff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  const blinkText = this.add.text(400, 550, 'Total Blinks: 0', {
    fontSize: '18px',
    color: '#00ffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 更新计时器显示
  let elapsed = 0;
  const timer = this.time.addEvent({
    delay: 100, // 每100ms更新一次
    callback: () => {
      elapsed += 0.1;
      const remaining = Math.max(0, 3 - elapsed);
      timerText.setText(`Time Remaining: ${remaining.toFixed(1)}s`);
      blinkText.setText(`Total Blinks: ${blinkCount}`);
    },
    loop: true
  });
  
  // 3秒后停止所有动画
  this.time.delayedCall(3000, () => {
    // 停止所有tween
    tweens.forEach(tween => {
      tween.stop();
    });
    
    // 将所有物体的alpha设置为1（完全可见）
    objects.forEach(obj => {
      obj.setAlpha(1);
    });
    
    // 更新状态
    animationStatus = 'stopped';
    statusText.setText('Animation Status: Stopped');
    statusText.setColor('#ff0000');
    timerText.setText('Time Remaining: 0.0s');
    
    // 停止计时器
    timer.remove();
    
    // 显示完成信息
    const completeText = this.add.text(400, 520, '✓ Animation Complete!', {
      fontSize: '22px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 让完成文本闪烁一次
    this.tweens.add({
      targets: completeText,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
    
    console.log('Animation stopped after 3 seconds');
    console.log('Final status:', animationStatus);
    console.log('Total blinks:', blinkCount);
  });
  
  // 添加说明文字
  this.add.text(400, 90, '20 objects blinking synchronously', {
    fontSize: '16px',
    color: '#cccccc',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);