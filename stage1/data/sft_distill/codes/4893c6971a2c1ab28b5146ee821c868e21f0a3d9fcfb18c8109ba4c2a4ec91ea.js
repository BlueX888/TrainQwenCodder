const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  objectsCreated: 0,
  animationsStarted: 0,
  animationsCompleted: 0,
  totalObjects: 8,
  animationDuration: 500,
  status: 'initializing'
};

function preload() {
  window.__signals__.status = 'preloading';
}

function create() {
  window.__signals__.status = 'creating';
  
  // 创建Graphics对象用于生成纹理
  const graphics = this.add.graphics();
  
  // 生成一个彩色圆形纹理
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
  
  // 创建8个精灵对象
  const objects = [];
  const spacing = 80;
  const startX = (800 - (7 * spacing)) / 2;
  const startY = 300;
  
  // 颜色数组用于区分不同对象
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0xff1493];
  
  for (let i = 0; i < 8; i++) {
    // 为每个对象创建不同颜色的纹理
    const g = this.add.graphics();
    g.fillStyle(colors[i], 1);
    g.fillCircle(25, 25, 25);
    g.generateTexture(`circle${i}`, 50, 50);
    g.destroy();
    
    // 创建精灵
    const sprite = this.add.sprite(startX + i * spacing, startY, `circle${i}`);
    sprite.setAlpha(0); // 初始透明度为0
    objects.push(sprite);
    
    window.__signals__.objectsCreated++;
  }
  
  console.log(`[CREATE] Created ${objects.length} objects`);
  
  // 创建同步淡入淡出动画
  const tweens = [];
  
  objects.forEach((obj, index) => {
    const tween = this.tweens.add({
      targets: obj,
      alpha: { from: 0, to: 1 },
      duration: 250, // 0.25秒淡入
      yoyo: true, // 自动淡出
      ease: 'Sine.easeInOut',
      onStart: () => {
        window.__signals__.animationsStarted++;
        console.log(`[TWEEN] Animation started for object ${index}`);
      },
      onComplete: () => {
        window.__signals__.animationsCompleted++;
        console.log(`[TWEEN] Animation completed for object ${index}`);
        
        // 当所有动画完成时更新状态
        if (window.__signals__.animationsCompleted === window.__signals__.totalObjects) {
          window.__signals__.status = 'completed';
          console.log('[STATUS] All animations completed!');
          console.log(JSON.stringify(window.__signals__, null, 2));
        }
      }
    });
    
    tweens.push(tween);
  });
  
  window.__signals__.status = 'animating';
  
  // 添加文本显示状态
  const statusText = this.add.text(400, 50, '', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  // 更新状态文本
  this.time.addEvent({
    delay: 50,
    loop: true,
    callback: () => {
      statusText.setText([
        `Objects Created: ${window.__signals__.objectsCreated}/${window.__signals__.totalObjects}`,
        `Animations Started: ${window.__signals__.animationsStarted}`,
        `Animations Completed: ${window.__signals__.animationsCompleted}`,
        `Status: ${window.__signals__.status}`,
        `Duration: ${window.__signals__.animationDuration}ms (0.5s total)`
      ]);
    }
  });
  
  // 添加说明文本
  this.add.text(400, 500, 'Watch the 8 circles fade in and out synchronously for 0.5 seconds', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);