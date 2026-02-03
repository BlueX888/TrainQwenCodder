const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationStatus = 'running';
let statusText;
let objects = [];
let tweens = [];

function preload() {
  // 使用 Graphics 创建3种颜色的纹理
  const graphics = this.add.graphics();
  
  // 红色矩形
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('redBox', 80, 80);
  graphics.clear();
  
  // 绿色矩形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('greenBox', 80, 80);
  graphics.clear();
  
  // 蓝色矩形
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('blueBox', 80, 80);
  
  graphics.destroy();
}

function create() {
  // 创建标题文本
  this.add.text(400, 50, '同步抖动动画演示', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建3个物体
  const object1 = this.add.sprite(200, 300, 'redBox');
  const object2 = this.add.sprite(400, 300, 'greenBox');
  const object3 = this.add.sprite(600, 300, 'blueBox');
  
  objects = [object1, object2, object3];
  
  // 为每个物体添加标签
  this.add.text(200, 400, '物体 1', {
    fontSize: '20px',
    color: '#ff0000'
  }).setOrigin(0.5);
  
  this.add.text(400, 400, '物体 2', {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  this.add.text(600, 400, '物体 3', {
    fontSize: '20px',
    color: '#0000ff'
  }).setOrigin(0.5);
  
  // 创建状态显示文本
  statusText = this.add.text(400, 500, '状态: 运行中', {
    fontSize: '24px',
    color: '#ffff00',
    backgroundColor: '#333333',
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5);
  
  // 为每个物体创建同步的抖动动画
  objects.forEach((obj, index) => {
    // 保存初始位置
    obj.initialX = obj.x;
    obj.initialY = obj.y;
    
    // 创建抖动 Tween（X轴）
    const tweenX = this.tweens.add({
      targets: obj,
      x: obj.x + Phaser.Math.Between(-10, 10),
      duration: 50,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 创建抖动 Tween（Y轴）
    const tweenY = this.tweens.add({
      targets: obj,
      y: obj.y + Phaser.Math.Between(-10, 10),
      duration: 50,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    tweens.push(tweenX, tweenY);
  });
  
  // 2.5秒后停止所有动画
  this.time.delayedCall(2500, () => {
    // 停止所有 Tween
    tweens.forEach(tween => {
      tween.stop();
    });
    
    // 将物体恢复到初始位置
    objects.forEach(obj => {
      this.tweens.add({
        targets: obj,
        x: obj.initialX,
        y: obj.initialY,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    // 更新状态
    animationStatus = 'stopped';
    statusText.setText('状态: 已停止');
    statusText.setColor('#00ff00');
    
    // 添加完成提示
    const completeText = this.add.text(400, 550, '✓ 动画已完成', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: completeText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  });
  
  // 添加计时器显示
  let elapsedTime = 0;
  const timerText = this.add.text(400, 150, '已运行: 0.0s', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.time.addEvent({
    delay: 100,
    callback: () => {
      if (animationStatus === 'running') {
        elapsedTime += 0.1;
        timerText.setText(`已运行: ${elapsedTime.toFixed(1)}s / 2.5s`);
      }
    },
    loop: true
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);