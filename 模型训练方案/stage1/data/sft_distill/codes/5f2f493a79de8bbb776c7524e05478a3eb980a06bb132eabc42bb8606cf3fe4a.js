// 场景旋转效果实现
class RotationScene extends Phaser.Scene {
  constructor() {
    super('RotationScene');
    this.rotationStatus = 'not_started';
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 初始化状态信号
    window.__signals__ = {
      rotationStatus: 'not_started',
      rotationProgress: 0,
      rotationComplete: false,
      timestamp: Date.now()
    };

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);

    // 创建中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 20);

    // 创建多个可视化元素以便观察旋转
    // 左上角方块
    const topLeft = this.add.graphics();
    topLeft.fillStyle(0x4ecdc4, 1);
    topLeft.fillRect(50, 50, 100, 100);
    topLeft.lineStyle(3, 0xffffff, 1);
    topLeft.strokeRect(50, 50, 100, 100);

    // 右上角圆形
    const topRight = this.add.graphics();
    topRight.fillStyle(0xffe66d, 1);
    topRight.fillCircle(width - 100, 100, 50);
    topRight.lineStyle(3, 0xffffff, 1);
    topRight.strokeCircle(width - 100, 100, 50);

    // 左下角三角形
    const bottomLeft = this.add.graphics();
    bottomLeft.fillStyle(0xff6b9d, 1);
    bottomLeft.fillTriangle(
      50, height - 50,
      150, height - 50,
      100, height - 150
    );
    bottomLeft.lineStyle(3, 0xffffff, 1);
    bottomLeft.strokeTriangle(
      50, height - 50,
      150, height - 50,
      100, height - 150
    );

    // 右下角矩形
    const bottomRight = this.add.graphics();
    bottomRight.fillStyle(0x95e1d3, 1);
    bottomRight.fillRect(width - 150, height - 150, 120, 80);
    bottomRight.lineStyle(3, 0xffffff, 1);
    bottomRight.strokeRect(width - 150, height - 150, 120, 80);

    // 添加文字提示
    const text = this.add.text(width / 2, height / 2, 'ROTATING...', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    text.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;
    
    // 设置旋转中心点为屏幕中心
    camera.setOrigin(0.5, 0.5);
    camera.centerOn(width / 2, height / 2);

    // 更新状态
    this.rotationStatus = 'rotating';
    window.__signals__.rotationStatus = 'rotating';
    window.__signals__.timestamp = Date.now();

    console.log(JSON.stringify({
      event: 'rotation_started',
      duration: 1500,
      timestamp: Date.now()
    }));

    // 创建旋转 Tween
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2, // 360度旋转
      duration: 1500,
      ease: 'Cubic.easeInOut',
      onUpdate: (tween) => {
        const progress = tween.progress;
        window.__signals__.rotationProgress = Math.round(progress * 100);
        
        // 更新文字显示进度
        text.setText(`ROTATING... ${Math.round(progress * 100)}%`);
      },
      onComplete: () => {
        // 旋转完成
        this.rotationStatus = 'completed';
        window.__signals__.rotationStatus = 'completed';
        window.__signals__.rotationComplete = true;
        window.__signals__.rotationProgress = 100;
        window.__signals__.completedAt = Date.now();

        // 重置相机旋转以避免累积
        camera.setRotation(0);

        // 更新文字
        text.setText('ROTATION COMPLETE!');
        text.setColor('#4ecdc4');

        console.log(JSON.stringify({
          event: 'rotation_completed',
          status: 'success',
          duration: 1500,
          timestamp: Date.now()
        }));

        // 3秒后淡出文字
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 1000
          });
        });
      }
    });

    // 添加调试信息
    const debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    debugText.setDepth(1000);

    // 更新调试信息
    this.time.addEvent({
      delay: 100,
      callback: () => {
        const signals = window.__signals__;
        debugText.setText([
          `Status: ${signals.rotationStatus}`,
          `Progress: ${signals.rotationProgress}%`,
          `Complete: ${signals.rotationComplete}`,
          `Camera Rotation: ${(camera.rotation * 180 / Math.PI).toFixed(1)}°`
        ]);
      },
      loop: true
    });
  }

  update(time, delta) {
    // 可在此添加额外的更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: RotationScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);