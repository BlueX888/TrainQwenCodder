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

// 状态变量：记录动画完成的物体数量
let animationCompletedCount = 0;
let totalObjects = 5;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置状态
  animationCompletedCount = 0;
  
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const objects = [];
  
  // 创建5个圆形物体
  for (let i = 0; i < totalObjects; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, 30); // 圆心在(0,0)，半径30
    
    // 设置位置（横向排列）
    graphics.x = 150 + i * 120;
    graphics.y = 300;
    
    objects.push(graphics);
  }
  
  // 为所有物体创建同步的缩放动画
  objects.forEach((obj, index) => {
    this.tweens.add({
      targets: obj,
      scaleX: 2,
      scaleY: 2,
      duration: 500, // 0.5秒
      ease: 'Power2',
      onComplete: () => {
        animationCompletedCount++;
        console.log(`物体 ${index + 1} 动画完成，总完成数: ${animationCompletedCount}/${totalObjects}`);
        
        // 当所有动画完成时输出状态
        if (animationCompletedCount === totalObjects) {
          console.log('所有物体缩放动画已完成！');
        }
      }
    });
  });
  
  // 添加文本显示状态
  const statusText = this.add.text(10, 10, '', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 更新状态文本
  this.time.addEvent({
    delay: 100,
    callback: () => {
      statusText.setText([
        `动画完成数: ${animationCompletedCount}/${totalObjects}`,
        `状态: ${animationCompletedCount === totalObjects ? '已完成' : '进行中'}`
      ]);
    },
    loop: true
  });
  
  // 添加说明文本
  this.add.text(400, 500, '5个物体同时缩放至2倍大小（0.5秒）', {
    fontSize: '18px',
    fill: '#00ff00'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);