// 场景旋转效果演示
class RotationScene extends Phaser.Scene {
  constructor() {
    super('RotationScene');
    // 状态变量：用于验证旋转是否完成
    this.rotationComplete = false;
    this.rotationProgress = 0; // 0-100 表示旋转进度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffffff, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 10);

    // 创建多个可视化元素以便观察旋转效果
    this.createVisualElements();

    // 添加状态文本
    this.statusText = this.add.text(20, 20, 'Rotation Progress: 0%', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在屏幕上不随相机旋转

    this.completeText = this.add.text(20, 60, 'Status: Rotating...', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.completeText.setScrollFactor(0);

    // 获取主相机
    const camera = this.cameras.main;
    
    // 设置相机旋转中心为屏幕中心
    camera.setRotation(0);

    // 创建旋转动画 - 旋转360度（2π弧度），持续2秒
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2, // 360度 = 2π弧度
      duration: 2000, // 2秒
      ease: 'Cubic.easeInOut', // 缓动函数，使旋转更平滑
      onUpdate: (tween) => {
        // 更新旋转进度
        this.rotationProgress = Math.floor(tween.progress * 100);
        this.statusText.setText(`Rotation Progress: ${this.rotationProgress}%`);
      },
      onComplete: () => {
        // 旋转完成
        this.rotationComplete = true;
        this.rotationProgress = 100;
        this.completeText.setText('Status: Rotation Complete!');
        this.completeText.setColor('#00ff00');
        
        // 重置相机旋转为0，避免累积
        camera.setRotation(0);
        
        console.log('Scene rotation completed!');
      }
    });

    // 添加提示文本
    const hintText = this.add.text(width / 2, height - 40, 
      'Watch the scene rotate for 2 seconds', {
      fontSize: '18px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    hintText.setOrigin(0.5);
    hintText.setScrollFactor(0);
  }

  createVisualElements() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // 创建四个角落的方块
    const corners = [
      { x: 100, y: 100, color: 0xff6b6b },
      { x: width - 100, y: 100, color: 0x4ecdc4 },
      { x: 100, y: height - 100, color: 0xffe66d },
      { x: width - 100, y: height - 100, color: 0x95e1d3 }
    ];

    corners.forEach(corner => {
      const graphics = this.add.graphics();
      graphics.fillStyle(corner.color, 1);
      graphics.fillRect(corner.x - 30, corner.y - 30, 60, 60);
      
      // 添加边框
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(corner.x - 30, corner.y - 30, 60, 60);
    });

    // 创建中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xf38181, 1);
    centerCircle.fillCircle(centerX, centerY, 50);
    centerCircle.lineStyle(4, 0xffffff, 1);
    centerCircle.strokeCircle(centerX, centerY, 50);

    // 创建放射状线条
    const lineGraphics = this.add.graphics();
    lineGraphics.lineStyle(2, 0xaa96da, 0.8);
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const startX = centerX + Math.cos(angle) * 60;
      const startY = centerY + Math.sin(angle) * 60;
      const endX = centerX + Math.cos(angle) * 150;
      const endY = centerY + Math.sin(angle) * 150;
      
      lineGraphics.lineBetween(startX, startY, endX, endY);
      
      // 在线条末端添加小圆点
      const dotGraphics = this.add.graphics();
      dotGraphics.fillStyle(0xfcbad3, 1);
      dotGraphics.fillCircle(endX, endY, 8);
    }

    // 添加网格参考线
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    // 垂直线
    for (let x = 0; x < width; x += 100) {
      gridGraphics.lineBetween(x, 0, x, height);
    }
    
    // 水平线
    for (let y = 0; y < height; y += 100) {
      gridGraphics.lineBetween(0, y, width, y);
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前场景主要依赖 Tween 动画，不需要每帧更新
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

// 导出状态访问接口（用于测试验证）
window.getRotationStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    rotationComplete: scene.rotationComplete,
    rotationProgress: scene.rotationProgress
  };
};