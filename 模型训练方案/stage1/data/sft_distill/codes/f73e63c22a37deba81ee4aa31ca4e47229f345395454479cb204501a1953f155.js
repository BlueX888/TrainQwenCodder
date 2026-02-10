// LoadingScene - 资源加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadProgress = 0;
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建进度文本
    const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontSize: '24px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 创建进度条背景（灰色边框）
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 10, 320, 30);

    // 创建进度条填充（黄色）
    const progressBar = this.add.graphics();

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      this.loadProgress = value;
      percentText.setText(Math.floor(value * 100) + '%');
      
      // 更新黄色进度条
      progressBar.clear();
      progressBar.fillStyle(0xffff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2, 300 * value, 10);
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
      loadingText.setText('Complete!');
      
      // 延迟后切换到主场景
      this.time.delayedCall(500, () => {
        this.scene.start('MainScene', { loadProgress: this.loadProgress });
      });
    });

    // 模拟加载资源 - 使用Graphics生成纹理
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建道具纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    itemGraphics.generateTexture('item', 32, 32);
    itemGraphics.destroy();

    // 创建背景纹理
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x0088ff, 1);
    bgGraphics.fillRect(0, 0, 64, 64);
    bgGraphics.generateTexture('background', 64, 64);
    bgGraphics.destroy();

    // 模拟额外加载时间（可选）
    for (let i = 0; i < 10; i++) {
      this.load.image(`dummy${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }
  }

  create() {
    // preload完成后的初始化（如果需要）
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.itemsCollected = 0;
  }

  init(data) {
    // 接收从LoadingScene传递的数据
    this.loadProgress = data.loadProgress || 1;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#001122');

    // 显示加载完成信息
    this.add.text(width / 2, 50, 'Loading Complete!', {
      fontSize: '28px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, `Load Progress: ${Math.floor(this.loadProgress * 100)}%`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示状态信息
    this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.healthText = this.add.text(20, 50, `Health: ${this.health}`, {
      fontSize: '20px',
      color: '#ff0000'
    });

    this.levelText = this.add.text(20, 80, `Level: ${this.level}`, {
      fontSize: '20px',
      color: '#ffff00'
    });

    this.itemsText = this.add.text(20, 110, `Items: ${this.itemsCollected}`, {
      fontSize: '20px',
      color: '#00ffff'
    });

    // 创建玩家精灵
    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.setScale(1.5);

    // 创建敌人
    this.enemy = this.add.sprite(width - 100, 200, 'enemy');
    this.enemy.setScale(1.2);

    // 创建道具
    this.item = this.add.sprite(width / 2, height - 100, 'item');
    this.item.setScale(1.3);

    // 添加背景装饰
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(200, height - 150);
      const bg = this.add.sprite(x, y, 'background');
      bg.setAlpha(0.3);
    }

    // 添加交互提示
    this.add.text(width / 2, height - 30, 'Click anywhere to increase score', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 点击增加分数
    this.input.on('pointerdown', (pointer) => {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);

      // 创建点击特效
      const circle = this.add.graphics();
      circle.fillStyle(0xffff00, 0.5);
      circle.fillCircle(pointer.x, pointer.y, 20);
      
      this.tweens.add({
        targets: circle,
        alpha: 0,
        scale: 2,
        duration: 500,
        onComplete: () => circle.destroy()
      });

      // 每100分升级
      if (this.score % 100 === 0 && this.score > 0) {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
      }
    });

    // 玩家动画 - 上下浮动
    this.tweens.add({
      targets: this.player,
      y: height / 2 + 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 敌人动画 - 旋转
    this.tweens.add({
      targets: this.enemy,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });

    // 道具动画 - 缩放闪烁
    this.tweens.add({
      targets: this.item,
      scale: 1.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 定时收集道具
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.itemsCollected++;
        this.itemsText.setText(`Items: ${this.itemsCollected}`);
        this.health = Math.min(100, this.health + 10);
        this.healthText.setText(`Health: ${this.health}`);
      },
      loop: true
    });

    // 定时减少生命值
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.health = Math.max(0, this.health - 5);
        this.healthText.setText(`Health: ${this.health}`);
        
        if (this.health === 0) {
          this.add.text(width / 2, height / 2, 'Game Over!', {
            fontSize: '48px',
            color: '#ff0000'
          }).setOrigin(0.5);
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);