const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let rotationCount = 0;
let statusText;
let isRotating = false;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 获取主相机
  const camera = this.cameras.main;
  
  // 绘制一些可视化元素以便观察旋转效果
  const graphics = this.add.graphics();
  
  // 绘制中心参考点
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(400, 300, 10);
  
  // 绘制四个角落的矩形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(50, 50, 100, 80);
  
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(650, 50, 100, 80);
  
  graphics.fillStyle(0xffff00, 1);
  graphics.fillRect(50, 470, 100, 80);
  
  graphics.fillStyle(0xff00ff, 1);
  graphics.fillRect(650, 470, 100, 80);
  
  // 绘制中心文字背景
  graphics.fillStyle(0x333333, 0.8);
  graphics.fillRect(250, 280, 300, 40);
  
  // 创建状态文本
  statusText = this.add.text(400, 300, 'Click to Rotate Camera', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5);
  
  // 创建旋转计数文本
  const countText = this.add.text(400, 50, `Rotations: ${rotationCount}`, {
    fontSize: '20px',
    color: '#00ff00',
    align: 'center'
  });
  countText.setOrigin(0.5);
  countText.setScrollFactor(0); // 固定在屏幕上，不受相机旋转影响
  
  // 监听鼠标左键按下事件
  this.input.on('pointerdown', (pointer) => {
    // 只处理左键点击
    if (pointer.leftButtonDown()) {
      if (!isRotating) {
        isRotating = true;
        rotationCount++;
        
        // 更新状态文本
        statusText.setText('Rotating...');
        countText.setText(`Rotations: ${rotationCount}`);
        
        // 触发相机旋转效果
        // 每次旋转 360 度（2 * Math.PI 弧度），持续 4000 毫秒
        const currentRotation = camera.rotation;
        const targetRotation = currentRotation + Math.PI * 2;
        
        camera.rotateTo(targetRotation, false, 4000, 'Linear', true, (cam, progress) => {
          // 旋转完成回调
          if (progress === 1) {
            isRotating = false;
            statusText.setText('Click to Rotate Camera');
            console.log(`Rotation ${rotationCount} completed`);
          }
        });
        
        console.log(`Rotation ${rotationCount} started`);
      } else {
        console.log('Camera is already rotating, please wait...');
      }
    }
  });
  
  // 添加提示文本
  const hintText = this.add.text(400, 550, 'Left Click anywhere to trigger 4-second camera rotation', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  });
  hintText.setOrigin(0.5);
  hintText.setScrollFactor(0);
}

function update(time, delta) {
  // 每帧更新逻辑（本例中不需要特殊更新）
}

new Phaser.Game(config);