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
let objectsVisible = true;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3, 0xff1493];
  
  // 创建8个圆形对象
  const startX = 100;
  const spacing = 80;
  const y = 300;
  const radius = 30;
  
  for (let i = 0; i < 8; i++) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, radius);
    
    // 生成纹理以便可以使用 alpha 属性
    const key = `circle${i}`;
    graphics.generateTexture(key, radius * 2, radius * 2);
    graphics.destroy();
    
    // 创建精灵对象
    const sprite = scene.add.sprite(startX + i * spacing, y, key);
    sprite.setAlpha(1); // 初始完全可见
    objects.push(sprite);
  }
  
  // 创建同步的淡入淡出动画
  const tweens = [];
  
  objects.forEach((obj) => {
    const tween = scene.tweens.add({
      targets: obj,
      alpha: 0, // 淡出到完全透明
      duration: 500, // 淡出持续500ms
      yoyo: true, // 自动反向播放（淡入）
      repeat: 0, // 不重复（yoyo会自动完成一次淡入淡出）
      ease: 'Sine.easeInOut'
    });
    tweens.push(tween);
  });
  
  // 监听第一个 tween 完成事件来标记所有动画完成
  tweens[0].on('complete', () => {
    animationCompleted = true;
    objectsVisible = true; // 动画结束后物体是可见的（因为 yoyo）
    console.log('Animation completed!');
    console.log('Animation status:', { animationCompleted, objectsVisible });
  });
  
  // 添加状态显示文本
  const statusText = scene.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });
  
  // 更新状态显示
  scene.time.addEvent({
    delay: 100,
    callback: () => {
      const elapsed = tweens[0].totalElapsed;
      const progress = tweens[0].progress;
      const currentAlpha = objects[0].alpha.toFixed(2);
      
      statusText.setText([
        `Animation Completed: ${animationCompleted}`,
        `Objects Visible: ${objectsVisible}`,
        `Elapsed Time: ${elapsed.toFixed(0)}ms`,
        `Progress: ${(progress * 100).toFixed(1)}%`,
        `Current Alpha: ${currentAlpha}`
      ]);
    },
    loop: true
  });
  
  // 添加说明文本
  scene.add.text(400, 500, '8 Objects Synchronized Fade In/Out Animation (1 second)', {
    fontSize: '18px',
    fill: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加重新播放按钮
  const replayButton = scene.add.text(400, 550, 'Click to Replay', {
    fontSize: '16px',
    fill: '#00ff00',
    backgroundColor: '#333333',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5).setInteractive();
  
  replayButton.on('pointerdown', () => {
    animationCompleted = false;
    
    // 重置所有对象的 alpha 并重新播放动画
    objects.forEach((obj) => {
      obj.setAlpha(1);
      scene.tweens.add({
        targets: obj,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: 0,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          animationCompleted = true;
          objectsVisible = true;
        }
      });
    });
  });
  
  replayButton.on('pointerover', () => {
    replayButton.setStyle({ fill: '#ffff00' });
  });
  
  replayButton.on('pointerout', () => {
    replayButton.setStyle({ fill: '#00ff00' });
  });
}

new Phaser.Game(config);