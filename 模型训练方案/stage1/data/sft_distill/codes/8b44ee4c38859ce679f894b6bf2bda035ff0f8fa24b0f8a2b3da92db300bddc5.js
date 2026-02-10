const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态信号变量
let animationStatus = 'idle'; // idle, running, stopped
let elapsedTime = 0;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建5个不同颜色的圆形对象
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const objects = [];
  const tweens = [];
  
  // 在场景中均匀分布5个对象
  for (let i = 0; i < 5; i++) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, 30); // 圆心在(0,0)，半径30
    
    // 生成纹理以便使用sprite（方便应用缩放）
    graphics.generateTexture(`circle${i}`, 60, 60);
    graphics.destroy();
    
    // 创建sprite
    const sprite = scene.add.sprite(
      150 + i * 130, // x位置：均匀分布
      300,           // y位置：居中
      `circle${i}`
    );
    
    objects.push(sprite);
    
    // 为每个对象创建缩放动画
    const tween = scene.tweens.add({
      targets: sprite,
      scaleX: 2,
      scaleY: 2,
      duration: 1000,
      yoyo: true,      // 来回播放
      repeat: -1,      // 无限循环
      ease: 'Sine.easeInOut'
    });
    
    tweens.push(tween);
  }
  
  // 更新状态
  animationStatus = 'running';
  elapsedTime = 0;
  
  // 添加状态显示文本
  const statusText = scene.add.text(10, 10, '', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 2.5秒后停止所有动画
  scene.time.delayedCall(2500, () => {
    tweens.forEach(tween => {
      tween.stop();
    });
    animationStatus = 'stopped';
    console.log('动画已停止');
  });
  
  // 存储到场景数据中供update使用
  scene.data.set('statusText', statusText);
  scene.data.set('tweens', tweens);
  scene.data.set('objects', objects);
}

function update(time, delta) {
  const statusText = this.data.get('statusText');
  
  if (animationStatus === 'running') {
    elapsedTime += delta;
  }
  
  // 更新状态显示
  if (statusText) {
    statusText.setText([
      `Animation Status: ${animationStatus}`,
      `Elapsed Time: ${(elapsedTime / 1000).toFixed(2)}s`,
      `Target Duration: 2.50s`
    ]);
  }
}

new Phaser.Game(config);