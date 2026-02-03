// 固定随机种子，相同种子保证相同布局
const SEED = ['phaser3', 'deterministic', '12345'];

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子，确保确定性生成
    this.game.config.seed = SEED;
    Phaser.Math.RND.sow(SEED);

    // 创建黄色障碍物纹理
    this.createObstacleTexture();

    // 生成 5 个障碍物
    this.generateObstacles(5);

    // 显示当前 seed 信息
    this.displaySeedInfo();

    // 输出可验证的信号
    this.exportSignals();

    // 添加说明文本
    const instructions = this.add.text(10, 60, 
      '确定性生成演示\n相同 seed 下障碍物布局完全一致\n刷新页面验证布局不变', 
      {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
  }

  createObstacleTexture() {
    // 使用 Graphics 创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 80, 80);
    
    // 添加边框
    graphics.lineStyle(2, 0xffaa00, 1);
    graphics.strokeRect(0, 0, 80, 80);
    
    // 生成纹理
    graphics.generateTexture('obstacle', 80, 80);
    graphics.destroy();
  }

  generateObstacles(count) {
    const obstacleData = [];
    
    // 确保障碍物不重叠的最小间距
    const minDistance = 100;
    const margin = 100;
    
    for (let i = 0; i < count; i++) {
      let x, y, width, height;
      let validPosition = false;
      let attempts = 0;
      const maxAttempts = 50;
      
      // 尝试找到不重叠的位置
      while (!validPosition && attempts < maxAttempts) {
        // 使用确定性随机数生成位置和尺寸
        x = Phaser.Math.Between(margin, 800 - margin - 80);
        y = Phaser.Math.Between(margin + 100, 600 - margin - 80);
        width = Phaser.Math.Between(60, 120);
        height = Phaser.Math.Between(60, 120);
        
        // 检查是否与已有障碍物重叠
        validPosition = true;
        for (let existing of this.obstacles) {
          const dx = Math.abs(x - existing.x);
          const dy = Math.abs(y - existing.y);
          if (dx < minDistance && dy < minDistance) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      }
      
      // 创建障碍物精灵
      const obstacle = this.add.image(x, y, 'obstacle');
      obstacle.setDisplaySize(width, height);
      obstacle.setOrigin(0, 0);
      
      // 添加序号标签
      const label = this.add.text(
        x + width / 2, 
        y + height / 2, 
        `#${i + 1}`, 
        {
          fontSize: '20px',
          color: '#000000',
          fontStyle: 'bold'
        }
      );
      label.setOrigin(0.5, 0.5);
      
      // 保存障碍物信息
      const obstacleInfo = { 
        id: i + 1,
        x: Math.round(x), 
        y: Math.round(y), 
        width: Math.round(width), 
        height: Math.round(height),
        sprite: obstacle,
        label: label
      };
      
      this.obstacles.push(obstacleInfo);
      obstacleData.push({
        id: obstacleInfo.id,
        x: obstacleInfo.x,
        y: obstacleInfo.y,
        width: obstacleInfo.width,
        height: obstacleInfo.height
      });
    }
    
    // 保存到实例变量供验证使用
    this.obstacleData = obstacleData;
  }

  displaySeedInfo() {
    // 显示当前使用的 seed
    const seedText = `当前 Seed: ${JSON.stringify(SEED)}`;
    const seedDisplay = this.add.text(10, 10, seedText, {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    
    // 显示障碍物数量
    const countText = `障碍物数量: ${this.obstacles.length}`;
    const countDisplay = this.add.text(10, 35, countText, {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
  }

  exportSignals() {
    // 导出可验证的信号数据
    window.__signals__ = {
      seed: SEED,
      timestamp: Date.now(),
      obstacleCount: this.obstacles.length,
      obstacles: this.obstacleData,
      // 生成布局哈希用于快速验证
      layoutHash: this.generateLayoutHash()
    };
    
    // 输出到控制台便于验证
    console.log('=== 确定性生成验证信号 ===');
    console.log('Seed:', JSON.stringify(SEED));
    console.log('Layout Hash:', window.__signals__.layoutHash);
    console.log('Obstacles:', JSON.stringify(this.obstacleData, null, 2));
    console.log('提示: 刷新页面，Layout Hash 应保持不变');
  }

  generateLayoutHash() {
    // 简单哈希函数，用于快速验证布局是否一致
    let hash = 0;
    for (let obstacle of this.obstacleData) {
      hash = ((hash << 5) - hash) + obstacle.x;
      hash = ((hash << 5) - hash) + obstacle.y;
      hash = ((hash << 5) - hash) + obstacle.width;
      hash = ((hash << 5) - hash) + obstacle.height;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: SEED, // 设置全局随机种子
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 添加额外的验证信息
console.log('%c=== Phaser3 确定性生成演示 ===', 'color: #00ff00; font-size: 16px; font-weight: bold');
console.log('使用固定 seed 生成障碍物布局');
console.log('多次刷新页面，障碍物位置应完全一致');
console.log('查看 window.__signals__ 获取详细布局数据');