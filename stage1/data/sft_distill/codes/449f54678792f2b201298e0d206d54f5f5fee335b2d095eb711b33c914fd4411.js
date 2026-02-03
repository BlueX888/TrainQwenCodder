const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectsCreated: 0,
  animationStarted: false,
  animationCompleted: false,
  currentAlpha: 1,
  elapsedTime: 0,
  status: 'initializing'
};

function preload() {
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
  
  window.__signals__.status = 'preloaded';
  console.log(JSON.stringify({ event: 'preload_complete', time: Date.now() }));
}

function create() {
  const objects = [];
  const spacing = 90;
  const startX = 100;
  const startY = 300;
  
  // 创建8个圆形物体，排列成一行
  for (let i = 0; i < 8; i++) {
    const obj = this.add.sprite(startX + i * spacing, startY, 'circle');
    objects.push(obj);
  }
  
  window.__signals__.objectsCreated = objects.length;
  window.__signals__.status = 'objects_created';
  
  console.log(JSON.stringify({ 
    event: 'objects_created', 
    count: objects.length,
    time: Date.now() 
  }));
  
  // 创建同步闪烁动画
  const blinkTween = this.tweens.add({
    targets: objects,
    alpha: 0.2,
    duration: 250,
    yoyo: true,
    repeat: 2, // 重复2次，加上初始执行，总共闪烁3次
    ease: 'Sine.easeInOut',
    onStart: () => {
      window.__signals__.animationStarted = true;
      window.__signals__.status = 'animating';
      console.log(JSON.stringify({ 
        event: 'animation_started', 
        time: Date.now() 
      }));
    },
    onUpdate: (tween) => {
      // 记录当前alpha值
      if (objects[0]) {
        window.__signals__.currentAlpha = objects[0].alpha.toFixed(2);
      }
    },
    onComplete: () => {
      window.__signals__.animationCompleted = true;
      window.__signals__.status = 'completed';
      window.__signals__.currentAlpha = 1;
      
      console.log(JSON.stringify({ 
        event: 'animation_completed', 
        duration: window.__signals__.elapsedTime,
        time: Date.now() 
      }));
    }
  });
  
  // 1.5秒后停止动画
  this.time.delayedCall(1500, () => {
    if (blinkTween.isPlaying()) {
      blinkTween.stop();
      
      // 恢复所有物体的alpha为1
      objects.forEach(obj => {
        obj.alpha = 1;
      });
      
      window.__signals__.animationCompleted = true;
      window.__signals__.status = 'stopped_at_1500ms';
      window.__signals__.currentAlpha = 1;
      
      console.log(JSON.stringify({ 
        event: 'animation_stopped', 
        reason: 'time_limit_reached',
        duration: 1500,
        time: Date.now() 
      }));
    }
  });
  
  // 添加文本显示状态
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });
  
  this.events.on('update', () => {
    statusText.setText([
      `Objects: ${window.__signals__.objectsCreated}`,
      `Status: ${window.__signals__.status}`,
      `Alpha: ${window.__signals__.currentAlpha}`,
      `Time: ${window.__signals__.elapsedTime.toFixed(0)}ms`
    ]);
  });
}

function update(time, delta) {
  // 更新经过的时间
  if (window.__signals__.animationStarted && !window.__signals__.animationCompleted) {
    window.__signals__.elapsedTime += delta;
  }
}

new Phaser.Game(config);