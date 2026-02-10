// LoadingScene - 显示粉色进度条的加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadProgress = 0;
  }

  preload() {
    // 创建进度条背景
    const width = 400;
    const height = 30;
    const x = (this.cameras.main.width - width) / 2;
    const y = this.cameras.main.height / 2;

    // 绘制进度条背景（深灰色）
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x222222, 1);
    progressBg.fillRect(x, y, width, height);

    // 绘制进度条边框
    const progressBorder = this.add.graphics();
    progressBorder.lineStyle(3, 0xffffff, 1);
    progressBorder.strokeRect(x, y, width, height);

    // 创建进度条填充（粉色）
    const progressBar = this.add.graphics();

    // 添加加载文本
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      y - 50,
      'Loading...',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // 添加百分比文本
    const percentText = this.add.text(
      this.cameras.main.width / 2,
      y + 50,
      '0%',
      {
        fontSize: '24px',
        color: '#ff69b4',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      this.loadProgress = value;
      
      // 更新粉色进度条
      progressBar.clear();
      progressBar.fillStyle(0xff69b4, 1); // 粉色
      progressBar.fillRect(x, y, width * value, height);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      loadingText.setText('Loading Complete!');
    });

    // 模拟加载一些资源（程序化生成纹理）
    // 生成一个玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成一个敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 生成一个星星纹理
    const starGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    starGraphics.fillStyle(0xffff00, 1);
    starGraphics.fillStar(16, 16, 5, 8, 16);
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();

    // 模拟额外的加载延迟
    for (let i = 0; i < 10; i++) {
      this.load.image(`dummy${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  create() {
    // 添加场景状态标识
    this.registry.set('loadingComplete', true);
    this.registry.set('currentScene', 'LoadingScene');
    
    // 延迟切换到主场景（确保用户能看到100%）
    this.time.delayedCall(500, () => {
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    
    // 可验证的游戏状态变量
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.gameState = 'playing';
  }

  create() {
    // 设置场景标识
    this.registry.set('currentScene', 'MainScene');
    
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 显示标题
    this.add.text(
      this.cameras.main.width / 2,
      50,
      'Main Scene - Game Started!',
      {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // 显示状态信息
    this.statusText = this.add.text(
      20,
      100,
      this.getStatusText(),
      {
        fontSize: '20px',
        color: '#00ff00',
        fontFamily: 'Arial',
        lineSpacing: 10
      }
    );

    // 添加玩家精灵（使用预加载的纹理）
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setScale(2);

    // 添加一些敌人
    this.enemies = [];
    for (let i = 0; i < 3; i++) {
      const enemy = this.add.sprite(
        100 + i * 250,
        150,
        'enemy'
      );
      enemy.setScale(1.5);
      this.enemies.push(enemy);
    }

    // 添加星星
    this.stars = [];
    for (let i = 0; i < 5; i++) {
      const star = this.add.sprite(
        100 + i * 150,
        450,
        'star'
      );
      star.setScale(1.2);
      this.stars.push(star);
    }

    // 添加交互提示
    this.add.text(
      this.cameras.main.width / 2,
      550,
      'Click anywhere to increase score\nPress SPACE to take damage',
      {
        fontSize: '18px',
        color: '#ffff00',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5);

    // 添加点击事件
    this.input.on('pointerdown', () => {
      this.score += 10;
      this.updateStatus();
    });

    // 添加键盘事件
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加动画效果
    this.tweens.add({
      targets: this.player,
      y: 320,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 敌人旋转动画
    this.enemies.forEach((enemy, index) => {
      this.tweens.add({
        targets: enemy,
        angle: 360,
        duration: 2000 + index * 500,
        repeat: -1,
        ease: 'Linear'
      });
    });

    // 星星闪烁动画
    this.stars.forEach((star, index) => {
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: index * 200,
        ease: 'Sine.easeInOut'
      });
    });

    // 记录场景启动时间
    this.startTime = this.time.now;
    
    console.log('MainScene created - Game state initialized');
    console.log('Initial state:', {
      score: this.score,
      health: this.health,
      level: this.level,
      gameState: this.gameState
    });
  }

  update(time, delta) {
    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.health = Math.max(0, this.health - 10);
      this.updateStatus();
      
      if (this.health === 0) {
        this.gameState = 'gameover';
        this.showGameOver();
      }
    }

    // 每1000分升级
    const newLevel = Math.floor(this.score / 1000) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.updateStatus();
      this.showLevelUp();
    }
  }

  getStatusText() {
    const playTime = this.startTime ? Math.floor((this.time.now - this.startTime) / 1000) : 0;
    return `Score: ${this.score}
Health: ${this.health}
Level: ${this.level}
State: ${this.gameState}
Play Time: ${playTime}s`;
  }

  updateStatus() {
    this.statusText.setText(this.getStatusText());
    
    // 改变颜色根据健康状态
    if (this.health > 50) {
      this.statusText.setColor('#00ff00');
    } else if (this.health > 20) {
      this.statusText.setColor('#ffff00');
    } else {
      this.statusText.setColor('#ff0000');
    }
  }

  showLevelUp() {
    const levelUpText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      `LEVEL UP! Level ${this.level}`,
      {
        fontSize: '48px',
        color: '#ffff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: levelUpText,
      alpha: 0,
      scale: 2,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        levelUpText.destroy();
      }
    });
  }

  showGameOver() {
    const gameOverText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'GAME OVER\nFinal Score: ' + this.score,
      {
        fontSize: '48px',
        color: '#ff0000',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);

    // 停止所有动画
    this.tweens.pauseAll();
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

// 导出状态验证函数（用于测试）
window.getGameState = function() {
  const mainScene = game.scene.getScene('MainScene');
  if (mainScene) {
    return {
      score: mainScene.score,
      health: mainScene.health,
      level: mainScene.level,
      gameState: mainScene.gameState,
      currentScene: game.registry.get('currentScene'),
      loadingComplete: game.registry.get('loadingComplete')
    };
  }
  return {
    currentScene: game.registry.get('currentScene'),
    loadingComplete: game.registry.get('loadingComplete')
  };
};