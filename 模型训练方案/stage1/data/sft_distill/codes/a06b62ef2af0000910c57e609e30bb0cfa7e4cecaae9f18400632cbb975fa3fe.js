class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationComplete = false; // 状态信号：旋转是否完成
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景和参照物，用于观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制背景网格
    graphics.lineStyle(2, 0x444444, 1);
    for (let i = 0; i <= 800; i += 100) {
      graphics.lineBetween(i, 0, i, 600);
    }
    for (let j = 0; j <= 600; j += 100) {
      graphics.lineBetween(0, j, 800, j);
    }
    
    // 绘制中心参照物
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 50);
    
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(200, 150, 100, 80);
    
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(500, 350, 100, 80);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillTriangle(
      400, 100,
      350, 200,
      450, 200
    );
    
    // 添加文本提示
    const text = this.add.text(400, 50, 'Scene Rotation Demo', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    text.setOrigin(0.5);
    
    const statusText = this.add.text(400, 550, 'Status: Rotating...', {
      fontSize: '24px',
      color: '#00ff00'
    });
    statusText.setOrigin(0.5);
    
    // 获取主摄像机
    const camera = this.cameras.main;
    
    // 设置摄像机旋转中心点为场景中心
    camera.setOrigin(0.5, 0.5);
    
    // 创建旋转动画
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
      duration: 1000, // 持续 1 秒
      ease: 'Cubic.easeInOut', // 使用缓动效果使旋转更平滑
      onComplete: () => {
        // 旋转完成回调
        this.rotationComplete = true;
        statusText.setText('Status: Rotation Complete!');
        statusText.setColor('#ffff00');
        
        console.log('Scene rotation completed!');
        console.log('Rotation status:', this.rotationComplete);
        
        // 重置摄像机旋转以避免累积
        camera.setRotation(0);
      }
    });
    
    // 添加调试信息
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.rotationComplete) {
          console.log('Current rotation:', camera.rotation.toFixed(2));
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供外部验证（可选）
window.getGameStatus = function() {
  const scene = game.scene.getScene('GameScene');
  return {
    rotationComplete: scene ? scene.rotationComplete : false,
    cameraRotation: scene ? scene.cameras.main.rotation : 0
  };
};