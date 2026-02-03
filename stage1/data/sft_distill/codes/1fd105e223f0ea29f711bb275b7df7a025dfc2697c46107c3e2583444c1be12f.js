class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.scaleComplete = false; // 状态信号：缩放是否完成
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.3);
    
    // 绘制网格线
    for (let x = 0; x <= width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 添加中心标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 30);
    
    // 添加文字提示
    const text = this.add.text(width / 2, height / 2, 'Scaling Scene', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    // 添加四个角的矩形
    const cornerSize = 40;
    const corners = [
      { x: cornerSize, y: cornerSize, color: 0xff00ff },
      { x: width - cornerSize, y: cornerSize, color: 0xffff00 },
      { x: cornerSize, y: height - cornerSize, color: 0x00ffff },
      { x: width - cornerSize, y: height - cornerSize, color: 0xff8800 }
    ];

    corners.forEach(corner => {
      const rect = this.add.graphics();
      rect.fillStyle(corner.color, 1);
      rect.fillRect(corner.x - 20, corner.y - 20, 40, 40);
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, 'Status: Scaling...', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 获取主相机
    const camera = this.cameras.main;
    
    // 设置初始缩放为0.1（非常小）
    camera.setZoom(0.1);

    // 使用 Tween 实现相机缩放动画
    this.tweens.add({
      targets: camera,
      zoom: 1.0, // 目标缩放值
      duration: 2000, // 持续2秒
      ease: 'Cubic.easeOut', // 缓动函数
      onUpdate: (tween) => {
        // 更新状态文本显示当前缩放值
        const currentZoom = camera.zoom.toFixed(2);
        const progress = (tween.progress * 100).toFixed(0);
        this.statusText.setText(`Status: Scaling... ${progress}% (Zoom: ${currentZoom})`);
      },
      onComplete: () => {
        // 缩放完成
        this.scaleComplete = true;
        this.statusText.setText('Status: Scale Complete! (Zoom: 1.00)');
        this.statusText.setColor('#ffff00');
        
        // 添加完成提示
        const completeText = this.add.text(width / 2, height - 50, 'Zoom Animation Complete!', {
          fontSize: '24px',
          color: '#00ff00',
          backgroundColor: '#000000',
          padding: { x: 15, y: 8 }
        });
        completeText.setOrigin(0.5);
        
        // 让完成提示闪烁
        this.tweens.add({
          targets: completeText,
          alpha: 0,
          duration: 500,
          yoyo: true,
          repeat: 3
        });
      }
    });

    // 也可以使用相机的内置 zoomTo 方法（备选方案，已注释）
    // camera.zoomTo(1.0, 2000, 'Cubic.easeOut');
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);