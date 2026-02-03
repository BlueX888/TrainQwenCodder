const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  rotationStarted: false,
  rotationCompleted: false,
  currentRotation: 0,
  elapsedTime: 0
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 绘制一个带有方向指示的场景
  // 中心圆形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(400, 300, 80);
  
  // 绘制方向指示器（三角形）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillTriangle(
    400, 220,  // 顶点（指向上方）
    370, 270,  // 左下
    430, 270   // 右下
  );
  
  // 绘制四个角的参考方块
  graphics.fillStyle(0x0088ff, 1);
  graphics.fillRect(50, 50, 60, 60);   // 左上
  graphics.fillRect(690, 50, 60, 60);  // 右上
  graphics.fillRect(50, 490, 60, 60);  // 左下
  graphics.fillRect(690, 490, 60, 60); // 右下
  
  // 添加文字提示
  const text = this.add.text(400, 450, 'Scene Rotating...', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  text.setOrigin(0.5);
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 设置相机旋转中心点为场景中心
  camera.setRotation(0);
  
  // 标记旋转开始
  window.__signals__.rotationStarted = true;
  
  // 创建旋转动画 Tween
  this.tweens.add({
    targets: camera,
    rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
    duration: 1500,        // 持续 1.5 秒
    ease: 'Sine.easeInOut',
    onUpdate: (tween) => {
      // 更新状态信号
      window.__signals__.currentRotation = camera.rotation;
    },
    onComplete: () => {
      // 旋转完成后重置为 0
      camera.setRotation(0);
      window.__signals__.rotationCompleted = true;
      window.__signals__.currentRotation = 0;
      
      // 更新文字提示
      text.setText('Rotation Complete!');
      text.setColor('#00ff00');
      
      // 输出完成日志
      console.log(JSON.stringify({
        event: 'rotation_complete',
        duration: 1500,
        finalRotation: 0,
        timestamp: Date.now()
      }));
    }
  });
  
  // 输出开始日志
  console.log(JSON.stringify({
    event: 'rotation_started',
    targetRotation: Math.PI * 2,
    duration: 1500,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 更新经过的时间
  window.__signals__.elapsedTime = time;
  
  // 如果旋转未完成，持续更新当前旋转角度
  if (window.__signals__.rotationStarted && !window.__signals__.rotationCompleted) {
    window.__signals__.currentRotation = this.cameras.main.rotation;
  }
}

new Phaser.Game(config);