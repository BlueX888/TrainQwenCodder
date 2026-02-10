// LoadingScene - 负责预加载资源并显示进度条
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingComplete = false;
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建进度条背景
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x222222, 0.8);
    progressBg.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 创建进度条
    const progressBar = this.add.graphics();

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建百分比文本
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      // 清除之前的进度条
      progressBar.clear();
      
      // 绘制绿色进度条
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      this.loadingComplete = true;
      progressBar.destroy();
      progressBg.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟加载资源 - 使用 Graphics 生成纹理
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建星星纹理
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffff00, 1);
    starGraphics.fillStar(16, 16, 5, 8, 16);
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();

    // 模拟加载延迟 - 使用假文件来产生加载进度
    for (let i = 0; i < 20; i++) {
      // 创建虚拟图片数据
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `hsl(${i * 18}, 100%, 50%)`;
      ctx.fillRect(0, 0, 64, 64);
      
      this.load.image(`dummy${i}`, canvas.toDataURL());
    }
  }

  create() {
    // 显示加载完成提示
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const completeText = this.add.text(width / 2, height / 2, 'Loading Complete!', {
      fontSize: '32px',
      color: '#00ff00'
    });
    completeText.setOrigin(0.5, 0.5);

    // 1秒后切换到主场景
    this.time.delayedCall(1000, () => {
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.level = 1;
    this.health = 100;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示场景标题
    this.add.text(width / 2, 50, 'Main Scene - Game Ready!', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示状态信息
    this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffff00'
    });

    this.levelText = this.add.text(20, 50, `Level: ${this.level}`, {
      fontSize: '20px',
      color: '#00ff00'
    });

    this.healthText = this.add.text(20, 80, `Health: ${this.health}`, {
      fontSize: '20px',
      color: '#ff0000'
    });

    // 创建示例游戏对象
    const player = this.add.sprite(width / 2, height / 2, 'player');
    player.setScale(2);

    const enemy1 = this.add.sprite(200, 200, 'enemy');
    enemy1.setScale(1.5);

    const enemy2 = this.add.sprite(600, 200, 'enemy');
    enemy2.setScale(1.5);

    const star = this.add.sprite(width / 2, height - 100, 'star');
    star.setScale(2);

    // 添加说明文本
    this.add.text(width / 2, height - 50, 'Assets loaded from LoadingScene', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 添加简单动画效果
    this.tweens.add({
      targets: star,
      y: star.y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加旋转动画
    this.tweens.add({
      targets: [enemy1, enemy2],
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });

    // 模拟游戏状态更新
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        
        if (this.score % 50 === 0) {
          this.level++;
          this.levelText.setText(`Level: ${this.level}`);
        }
      },
      loop: true
    });

    // 添加点击交互
    this.input.on('pointerdown', (pointer) => {
      this.health = Math.max(0, this.health - 10);
      this.healthText.setText(`Health: ${this.health}`);
      
      if (this.health === 0) {
        this.healthText.setColor('#ffffff');
        this.healthText.setText('Health: 0 - Game Over!');
      }
    });

    console.log('MainScene created - Game state:', {
      score: this.score,
      level: this.level,
      health: this.health,
      loadingComplete: true
    });
  }

  update(time, delta) {
    // 可以在这里添加每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene]  // 场景数组，按顺序启动第一个
};

// 创建游戏实例
new Phaser.Game(config);