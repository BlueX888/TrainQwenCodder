class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.scaleComplete = false; // 状态信号：缩放是否完成
    this.currentZoom = 0.1; // 状态信号：当前缩放值
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建中心标题文字
    const title = this.add.text(400, 200, 'SCALE EFFECT', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#00ff00',
      stroke: '#003300',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // 创建一些装饰性的圆形
    const circles = this.add.graphics();
    circles.lineStyle(4, 0x00ffff, 1);
    circles.strokeCircle(400, 300, 150);
    circles.strokeCircle(400, 300, 100);
    circles.strokeCircle(400, 300, 50);

    // 创建四个角落的矩形
    const corners = this.add.graphics();
    corners.fillStyle(0xff6b6b, 1);
    corners.fillRect(50, 50, 80, 80);
    corners.fillRect(670, 50, 80, 80);
    corners.fillRect(50, 470, 80, 80);
    corners.fillRect(670, 470, 80, 80);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 400, 'Scaling...', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.statusText.setOrigin(0.5);

    // 设置初始相机缩放
    this.cameras.main.setZoom(0.1);
    this.currentZoom = 0.1;

    // 创建缩放补间动画
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.0,
      duration: 1000,
      ease: 'Power2',
      onUpdate: (tween) => {
        // 更新当前缩放值
        this.currentZoom = this.cameras.main.zoom;
      },
      onComplete: () => {
        // 缩放完成
        this.scaleComplete = true;
        this.statusText.setText('Scale Complete!');
        this.statusText.setStyle({ color: '#00ff00' });
        
        // 输出验证信息到控制台
        console.log('Scene scale animation completed!');
        console.log('Final zoom:', this.cameras.main.zoom);
        console.log('Scale complete status:', this.scaleComplete);
      }
    });

    // 添加说明文本
    const instruction = this.add.text(400, 550, 'Watch the scene zoom in from small to normal size', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    instruction.setOrigin(0.5);
  }

  update(time, delta) {
    // 实时更新缩放值显示（可选，用于调试）
    if (!this.scaleComplete) {
      // 可以在这里添加额外的缩放进度显示
      const progress = Math.round((this.currentZoom / 1.0) * 100);
      // console.log('Zoom progress:', progress + '%');
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态变量用于外部验证
window.getGameStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    scaleComplete: scene.scaleComplete,
    currentZoom: scene.currentZoom,
    cameraZoom: scene.cameras.main.zoom
  };
};