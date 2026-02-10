const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationStatus = 0; // 0=未开始, 1=进行中, 2=已完成
let shakeObjects = [];
let shakeTweens = [];
let statusText;

function preload() {
  // 创建5种不同颜色的纹理
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  
  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(`box${index}`, 80, 80);
    graphics.destroy();
  });
}

function create() {
  // 创建状态文本
  statusText = this.add.text(400, 50, 'Animation Status: Ready', {
    fontSize: '24px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  // 创建5个物体，水平排列
  const startX = 160;
  const spacing = 120;
  const y = 300;
  
  for (let i = 0; i < 5; i++) {
    const box = this.add.sprite(startX + i * spacing, y, `box${i}`);
    shakeObjects.push(box);
  }
  
  // 启动抖动动画
  startShakeAnimation.call(this);
}

function startShakeAnimation() {
  animationStatus = 1;
  statusText.setText('Animation Status: Shaking (2s)');
  
  // 为每个物体创建抖动动画
  shakeObjects.forEach((obj, index) => {
    // 记录原始位置
    const originalX = obj.x;
    const originalY = obj.y;
    
    // 创建X轴抖动
    const tweenX = this.tweens.add({
      targets: obj,
      x: {
        from: originalX - 10,
        to: originalX + 10
      },
      duration: 50, // 快速抖动
      yoyo: true,
      repeat: -1, // 无限重复
      ease: 'Linear'
    });
    
    // 创建Y轴抖动（稍微延迟以产生更自然的抖动效果）
    const tweenY = this.tweens.add({
      targets: obj,
      y: {
        from: originalY - 8,
        to: originalY + 8
      },
      duration: 60,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
      delay: 25 // 轻微延迟使抖动更自然
    });
    
    shakeTweens.push(tweenX, tweenY);
  });
  
  // 2秒后停止所有抖动动画
  this.time.delayedCall(2000, () => {
    stopShakeAnimation.call(this);
  });
}

function stopShakeAnimation() {
  animationStatus = 2;
  statusText.setText('Animation Status: Completed');
  
  // 停止所有Tween
  shakeTweens.forEach(tween => {
    tween.stop();
  });
  
  // 将物体恢复到原始位置
  const startX = 160;
  const spacing = 120;
  const y = 300;
  
  shakeObjects.forEach((obj, index) => {
    this.tweens.add({
      targets: obj,
      x: startX + index * spacing,
      y: y,
      duration: 200,
      ease: 'Quad.easeOut'
    });
  });
  
  // 清空Tween数组
  shakeTweens = [];
  
  // 输出验证信息
  console.log('Shake animation completed. Status:', animationStatus);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前示例中主要逻辑在create和定时器中完成
}

const game = new Phaser.Game(config);