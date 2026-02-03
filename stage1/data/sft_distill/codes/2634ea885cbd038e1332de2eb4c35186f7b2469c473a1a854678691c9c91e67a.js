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

// 状态变量
let animationCompleted = false;
let animationCount = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文本
  const titleText = this.add.text(400, 50, '5个物体同步缩放动画', {
    fontSize: '28px',
    fill: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建状态显示文本
  const statusText = this.add.text(400, 100, '动画状态: 进行中', {
    fontSize: '20px',
    fill: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建计数器文本
  const counterText = this.add.text(400, 130, '完成数量: 0/5', {
    fontSize: '18px',
    fill: '#00ff00'
  }).setOrigin(0.5);
  
  // 定义5个物体的颜色和位置
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const objects = [];
  const spacing = 120;
  const startX = 160;
  const centerY = 350;
  
  // 创建5个圆形物体
  for (let i = 0; i < 5; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, 40);
    
    // 设置位置
    graphics.x = startX + i * spacing;
    graphics.y = centerY;
    
    objects.push(graphics);
    
    // 添加物体编号标签
    this.add.text(graphics.x, centerY + 70, `物体 ${i + 1}`, {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }
  
  // 为每个物体创建同步缩放动画
  const tweens = [];
  
  objects.forEach((obj, index) => {
    const tween = scene.tweens.add({
      targets: obj,
      scaleX: 2,
      scaleY: 2,
      duration: 1250, // 2.5秒的一半（因为使用yoyo）
      ease: 'Sine.easeInOut',
      yoyo: true, // 往返效果
      onComplete: () => {
        animationCount++;
        counterText.setText(`完成数量: ${animationCount}/5`);
        
        // 当所有动画完成时
        if (animationCount === 5) {
          animationCompleted = true;
          statusText.setText('动画状态: 已完成');
          statusText.setColor('#00ff00');
          
          // 添加完成提示
          const completeText = scene.add.text(400, 500, '✓ 所有动画已完成！', {
            fontSize: '24px',
            fill: '#00ff00',
            fontStyle: 'bold'
          }).setOrigin(0.5).setAlpha(0);
          
          // 完成文本淡入动画
          scene.tweens.add({
            targets: completeText,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
          });
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 添加进度条显示动画进度
  const progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x333333, 1);
  progressBarBg.fillRect(250, 170, 300, 20);
  
  const progressBar = this.add.graphics();
  
  // 更新进度条
  this.time.addEvent({
    delay: 50,
    callback: () => {
      const progress = tweens[0].progress; // 获取第一个动画的进度
      progressBar.clear();
      progressBar.fillStyle(0x00ffff, 1);
      progressBar.fillRect(250, 170, 300 * progress, 20);
      
      // 显示百分比
      if (!animationCompleted) {
        statusText.setText(`动画状态: 进行中 (${Math.floor(progress * 100)}%)`);
      }
    },
    loop: true
  });
  
  // 在控制台输出状态（便于验证）
  console.log('Animation started - animationCompleted:', animationCompleted);
  
  // 2.5秒后验证状态
  this.time.delayedCall(2600, () => {
    console.log('Animation should be completed - animationCompleted:', animationCompleted);
    console.log('Animation count:', animationCount);
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);