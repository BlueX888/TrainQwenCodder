const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let isBlinking = false;
let blinkingObjects = [];
let statusText = null;
let tweens = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 状态变量初始化
  isBlinking = true;
  blinkingObjects = [];
  tweens = [];
  
  // 创建标题文本
  const titleText = this.add.text(400, 30, '20个物体同步闪烁动画', {
    fontSize: '28px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 创建状态文本
  statusText = this.add.text(400, 70, '状态: 闪烁中...', {
    fontSize: '20px',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);
  
  // 创建倒计时文本
  const countdownText = this.add.text(400, 100, '剩余时间: 3.0秒', {
    fontSize: '18px',
    color: '#ffff00'
  });
  countdownText.setOrigin(0.5);
  
  // 创建20个圆形物体，排列成4行5列
  const cols = 5;
  const rows = 4;
  const startX = 150;
  const startY = 180;
  const spacingX = 130;
  const spacingY = 100;
  const radius = 30;
  
  for (let i = 0; i < 20; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    // 创建Graphics对象绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(x, y, radius);
    
    // 添加编号文本
    const numberText = this.add.text(x, y, (i + 1).toString(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    numberText.setOrigin(0.5);
    
    blinkingObjects.push({ graphics, text: numberText });
    
    // 创建闪烁动画 - alpha从1到0.2循环
    const tween = this.tweens.add({
      targets: [graphics, numberText],
      alpha: { from: 1, to: 0.2 },
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1 // 无限循环
    });
    
    tweens.push(tween);
  }
  
  // 倒计时更新
  let remainingTime = 3.0;
  this.time.addEvent({
    delay: 100,
    callback: () => {
      remainingTime -= 0.1;
      if (remainingTime > 0) {
        countdownText.setText(`剩余时间: ${remainingTime.toFixed(1)}秒`);
      } else {
        countdownText.setText('剩余时间: 0.0秒');
      }
    },
    repeat: 29 // 重复30次，总计3秒
  });
  
  // 3秒后停止所有闪烁动画
  this.time.delayedCall(3000, () => {
    // 停止所有tween动画
    tweens.forEach(tween => {
      tween.stop();
    });
    
    // 将所有物体的alpha设置为1（完全可见）
    blinkingObjects.forEach(obj => {
      obj.graphics.setAlpha(1);
      obj.text.setAlpha(1);
    });
    
    // 更新状态
    isBlinking = false;
    statusText.setText('状态: 已停止');
    statusText.setColor('#ff0000');
    
    // 添加完成提示
    const completeText = this.add.text(400, 560, '✓ 动画已完成！所有物体停止闪烁', {
      fontSize: '22px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    completeText.setOrigin(0.5);
    
    // 完成提示闪烁效果
    this.tweens.add({
      targets: completeText,
      alpha: { from: 0, to: 1 },
      duration: 300,
      ease: 'Power2'
    });
    
    console.log('闪烁动画已停止，状态变量 isBlinking =', isBlinking);
  });
  
  console.log('创建了', blinkingObjects.length, '个闪烁物体');
  console.log('初始状态 isBlinking =', isBlinking);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前实现中主要逻辑在create中通过tween和timer完成
}

new Phaser.Game(config);