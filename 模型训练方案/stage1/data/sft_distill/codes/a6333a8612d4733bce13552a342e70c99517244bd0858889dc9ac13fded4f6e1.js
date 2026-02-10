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

// 状态信号变量
let animationComplete = false;
let objectsCreated = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  
  // 创建8个物体的纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 60, 60);
  graphics.generateTexture('box', 60, 60);
  graphics.destroy();
  
  // 创建8个物体，排列成2行4列
  const cols = 4;
  const rows = 2;
  const startX = 150;
  const startY = 200;
  const spacingX = 150;
  const spacingY = 200;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      // 创建sprite物体
      const obj = this.add.sprite(x, y, 'box');
      obj.setAlpha(1); // 初始完全可见
      objects.push(obj);
      objectsCreated++;
    }
  }
  
  console.log(`Created ${objectsCreated} objects`);
  
  // 创建同步淡入淡出动画
  // 从alpha 1 淡出到 0，然后淡入回 1，持续1秒
  const tweens = [];
  
  objects.forEach((obj, index) => {
    const tween = scene.tweens.add({
      targets: obj,
      alpha: 0,
      duration: 500, // 淡出500ms
      yoyo: true,    // 自动淡入回来
      ease: 'Sine.easeInOut',
      onComplete: function() {
        // 只在第一个物体完成时标记
        if (index === 0) {
          animationComplete = true;
          console.log('Animation completed! All objects faded in/out.');
          console.log(`Animation status: ${animationComplete ? 'COMPLETE' : 'RUNNING'}`);
          console.log(`Total objects animated: ${objectsCreated}`);
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 添加文本说明
  const statusText = this.add.text(400, 50, 'Watch 8 objects fade in/out synchronously', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5);
  
  const timerText = this.add.text(400, 100, 'Animation Duration: 1 second', {
    fontSize: '18px',
    color: '#ffff00',
    align: 'center'
  });
  timerText.setOrigin(0.5);
  
  // 1秒后显示完成状态
  this.time.delayedCall(1000, () => {
    const completeText = this.add.text(400, 550, `Status: ${animationComplete ? 'COMPLETE ✓' : 'RUNNING'}`, {
      fontSize: '20px',
      color: animationComplete ? '#00ff00' : '#ff0000',
      align: 'center'
    });
    completeText.setOrigin(0.5);
  });
}

const game = new Phaser.Game(config);