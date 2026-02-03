class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.animationComplete = false;
    this.objectsCreated = 0;
    this.animationProgress = 0; // 0-100 表示动画进度百分比
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 创建10个物体数组
    this.objects = [];
    
    // 使用不同颜色创建10个圆形物体
    const colors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff,
      0x00ffff, 0xff8800, 0x88ff00, 0x0088ff, 0xff0088
    ];
    
    // 在场景中均匀分布10个物体
    for (let i = 0; i < 10; i++) {
      const graphics = this.add.graphics();
      const color = colors[i];
      
      // 绘制圆形
      graphics.fillStyle(color, 1);
      graphics.fillCircle(0, 0, 30);
      
      // 计算位置（2行5列布局）
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = width / 6 + (col * width / 6);
      const y = height / 3 + (row * height / 3);
      
      graphics.setPosition(x, y);
      
      // 设置初始透明度
      graphics.setAlpha(1);
      
      this.objects.push(graphics);
      this.objectsCreated++;
    }
    
    console.log(`创建了 ${this.objectsCreated} 个物体`);
    
    // 创建同步的淡入淡出动画
    this.objects.forEach((obj, index) => {
      this.tweens.add({
        targets: obj,
        alpha: 0, // 淡出到透明
        duration: 1000, // 1秒淡出
        yoyo: true, // 来回播放（淡入淡出）
        repeat: 0, // 只播放一次完整循环（淡出+淡入）
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          // 更新动画进度（使用第一个物体的进度作为整体进度）
          if (index === 0) {
            this.animationProgress = Math.round(tween.progress * 100);
          }
        },
        onComplete: () => {
          // 只在最后一个物体完成时标记动画完成
          if (index === this.objects.length - 1) {
            this.animationComplete = true;
            console.log('所有动画已完成');
            console.log(`最终状态 - 物体数量: ${this.objectsCreated}, 动画完成: ${this.animationComplete}`);
          }
        }
      });
    });
    
    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 2秒后的定时器（确保动画完成）
    this.time.delayedCall(2000, () => {
      console.log('2秒计时完成');
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `物体数量: ${this.objectsCreated}`,
      `动画进度: ${this.animationProgress}%`,
      `动画完成: ${this.animationComplete ? '是' : '否'}`,
      `运行时间: ${Math.floor(time / 1000)}秒`
    ]);
    
    // 动画完成后可以添加额外逻辑
    if (this.animationComplete && !this.finalMessageShown) {
      this.finalMessageShown = true;
      
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      this.add.text(centerX, centerY, '动画完成！', {
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);