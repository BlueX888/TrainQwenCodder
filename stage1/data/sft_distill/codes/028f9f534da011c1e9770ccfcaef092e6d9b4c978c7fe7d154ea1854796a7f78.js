class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.animationStatus = 'idle'; // idle, rotating, completed
    this.rotationCount = 0; // 完成旋转的物体数量
    this.totalObjects = 3;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    console.log('游戏开始 - 状态:', this.animationStatus);
    
    // 创建3个不同颜色的纹理
    this.createTexture('redBox', 0xff0000);
    this.createTexture('greenBox', 0x00ff00);
    this.createTexture('blueBox', 0x0000ff);

    // 创建3个精灵对象
    const startX = 200;
    const spacing = 200;
    const y = 300;

    this.object1 = this.add.sprite(startX, y, 'redBox');
    this.object2 = this.add.sprite(startX + spacing, y, 'greenBox');
    this.object3 = this.add.sprite(startX + spacing * 2, y, 'blueBox');

    // 存储所有对象以便管理
    this.rotatingObjects = [this.object1, this.object2, this.object3];

    // 添加文本显示状态
    this.statusText = this.add.text(400, 100, '状态: 准备开始', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.countText = this.add.text(400, 140, '完成数量: 0/3', {
      fontSize: '20px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 延迟500ms后开始旋转动画
    this.time.delayedCall(500, () => {
      this.startRotationAnimation();
    });
  }

  createTexture(key, color) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 80, 80);
    
    // 添加边框使物体更明显
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeRect(0, 0, 80, 80);
    
    // 添加方向指示器（一个小三角形）
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(40, 10, 50, 30, 30, 30);
    
    graphics.generateTexture(key, 80, 80);
    graphics.destroy();
  }

  startRotationAnimation() {
    this.animationStatus = 'rotating';
    this.statusText.setText('状态: 旋转中...');
    console.log('旋转动画开始');

    // 为每个对象创建旋转动画
    this.rotatingObjects.forEach((obj, index) => {
      this.tweens.add({
        targets: obj,
        angle: 360, // 旋转360度
        duration: 4000, // 持续4秒
        ease: 'Linear',
        onComplete: () => {
          this.onObjectRotationComplete(obj, index);
        }
      });
    });
  }

  onObjectRotationComplete(obj, index) {
    this.rotationCount++;
    console.log(`物体 ${index + 1} 旋转完成 (${this.rotationCount}/${this.totalObjects})`);
    
    // 更新计数文本
    this.countText.setText(`完成数量: ${this.rotationCount}/${this.totalObjects}`);
    
    // 所有物体都完成旋转
    if (this.rotationCount >= this.totalObjects) {
      this.animationStatus = 'completed';
      this.statusText.setText('状态: 动画完成！');
      console.log('所有旋转动画已完成');
      
      // 添加完成提示效果
      this.tweens.add({
        targets: this.statusText,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 2
      });
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前不需要持续更新
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

// 导出状态访问函数（用于验证）
window.getGameStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    status: scene.animationStatus,
    completedCount: scene.rotationCount,
    totalObjects: scene.totalObjects
  };
};