const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量
let rotationComplete = false;
let rotationProgress = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 绘制背景网格作为旋转参考
  graphics.lineStyle(2, 0x00ff00, 0.3);
  for (let x = 0; x < 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y < 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心标记物体
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xff0000, 1);
  centerGraphics.fillRect(350, 250, 100, 100);
  
  centerGraphics.fillStyle(0x0000ff, 1);
  centerGraphics.fillCircle(400, 300, 50);
  
  centerGraphics.fillStyle(0xffff00, 1);
  centerGraphics.fillTriangle(
    400, 200,
    350, 280,
    450, 280
  );
  
  // 添加文字提示
  const text = this.add.text(400, 50, 'Scene Rotation Demo', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  const statusText = this.add.text(400, 550, 'Rotating...', {
    fontSize: '24px',
    color: '#00ff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 获取主摄像机
  const camera = this.cameras.main;
  
  // 设置摄像机旋转中心点为场景中心
  camera.setRotation(0);
  
  // 创建旋转动画
  this.tweens.add({
    targets: camera,
    rotation: Math.PI * 2, // 旋转360度（2π弧度）
    duration: 2000, // 持续2秒
    ease: 'Sine.easeInOut',
    onUpdate: (tween) => {
      // 更新旋转进度
      rotationProgress = Math.round(tween.progress * 100);
      statusText.setText(`Rotating... ${rotationProgress}%`);
    },
    onComplete: () => {
      // 旋转完成
      rotationComplete = true;
      statusText.setText('Rotation Complete!');
      statusText.setColor('#ffff00');
      
      // 重置摄像机旋转为0（可选）
      camera.setRotation(0);
      
      console.log('Scene rotation completed!');
      console.log('rotationComplete:', rotationComplete);
    }
  });
  
  // 存储引用供update使用
  this.statusText = statusText;
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前状态可通过全局变量访问：
  // rotationComplete - 旋转是否完成
  // rotationProgress - 旋转进度（0-100）
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供外部验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { rotationComplete, rotationProgress };
}