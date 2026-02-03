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

// 状态变量：用于验证动画完成状态
let animationComplete = false;
let activeObjects = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const tweens = [];
  
  // 创建10个圆形物体
  for (let i = 0; i < 10; i++) {
    // 计算位置（两行排列）
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 150 + col * 130;
    const y = 200 + row * 200;
    
    // 使用Graphics绘制圆形
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ff88, 1);
    graphics.fillCircle(0, 0, 40);
    graphics.x = x;
    graphics.y = y;
    
    // 生成纹理并创建精灵（为了更好地支持alpha动画）
    graphics.generateTexture('circle' + i, 80, 80);
    graphics.destroy();
    
    const sprite = scene.add.sprite(x, y, 'circle' + i);
    sprite.setAlpha(0); // 初始透明
    objects.push(sprite);
    activeObjects++;
  }
  
  // 为所有物体创建同步的淡入淡出动画
  objects.forEach((obj, index) => {
    const tween = scene.tweens.add({
      targets: obj,
      alpha: {
        from: 0,
        to: 1
      },
      duration: 1000, // 1秒淡入
      yoyo: true,     // 启用yoyo效果，淡入后自动淡出
      repeat: 0,      // 只执行一次完整的淡入淡出
      ease: 'Sine.easeInOut',
      onComplete: () => {
        activeObjects--;
        if (activeObjects === 0) {
          animationComplete = true;
          console.log('所有动画已完成，状态：animationComplete =', animationComplete);
        }
      }
    });
    tweens.push(tween);
  });
  
  // 添加状态文本显示
  const statusText = scene.add.text(400, 50, '动画进行中...', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5);
  
  // 2秒后检查并更新状态（动画应该已完成）
  scene.time.delayedCall(2000, () => {
    if (animationComplete) {
      statusText.setText('动画已完成 ✓');
      statusText.setColor('#00ff88');
    }
    console.log('2秒计时完成');
    console.log('动画完成状态：', animationComplete);
    console.log('剩余活跃对象：', activeObjects);
  });
  
  // 添加说明文本
  const infoText = scene.add.text(400, 550, 
    '10个圆形物体同步淡入淡出动画\n持续2秒（1秒淡入 + 1秒淡出）', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  });
  infoText.setOrigin(0.5);
  
  // 在控制台输出初始状态
  console.log('动画开始');
  console.log('初始状态：animationComplete =', animationComplete);
  console.log('活跃对象数量：', activeObjects);
}

new Phaser.Game(config);