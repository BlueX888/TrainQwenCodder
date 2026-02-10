class RotationScene extends Phaser.Scene {
  constructor() {
    super('RotationScene');
    this.rotationComplete = false;
    this.rotationStartTime = 0;
    this.rotationEndTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      rotationStarted: false,
      rotationComplete: false,
      rotationDuration: 0,
      currentRotation: 0,
      startTime: 0,
      endTime: 0
    };

    // 创建一些可见的图形对象作为参照物
    const graphics = this.add.graphics();
    
    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);
    
    // 绘制四个角的矩形
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(50, 50, 100, 100);
    
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(650, 50, 100, 100);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(50, 450, 100, 100);
    
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(650, 450, 100, 100);
    
    // 绘制文字提示
    const text = this.add.text(400, 300, 'Scene Rotating...', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;
    
    // 设置相机旋转中心为场景中心
    camera.setRotation(0);
    
    // 记录开始时间
    this.rotationStartTime = this.time.now;
    window.__signals__.rotationStarted = true;
    window.__signals__.startTime = this.rotationStartTime;
    
    console.log(JSON.stringify({
      event: 'rotation_started',
      time: this.rotationStartTime,
      duration: 1500
    }));

    // 创建旋转动画 - 旋转一圈（2π 弧度）
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2, // 360度
      duration: 1500, // 1.5秒
      ease: 'Cubic.easeInOut',
      onUpdate: (tween) => {
        // 更新当前旋转角度
        window.__signals__.currentRotation = camera.rotation;
      },
      onComplete: () => {
        // 旋转完成
        this.rotationComplete = true;
        this.rotationEndTime = this.time.now;
        
        // 重置相机旋转为0，避免累积
        camera.setRotation(0);
        
        // 更新信号
        window.__signals__.rotationComplete = true;
        window.__signals__.endTime = this.rotationEndTime;
        window.__signals__.rotationDuration = this.rotationEndTime - this.rotationStartTime;
        window.__signals__.currentRotation = 0;
        
        // 更新文字
        text.setText('Rotation Complete!');
        
        console.log(JSON.stringify({
          event: 'rotation_completed',
          startTime: this.rotationStartTime,
          endTime: this.rotationEndTime,
          actualDuration: this.rotationEndTime - this.rotationStartTime,
          expectedDuration: 1500
        }));
      }
    });
  }

  update(time, delta) {
    // 持续更新旋转状态
    if (!this.rotationComplete) {
      window.__signals__.currentRotation = this.cameras.main.rotation;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RotationScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
if (typeof window !== 'undefined') {
  window.__game__ = game;
}